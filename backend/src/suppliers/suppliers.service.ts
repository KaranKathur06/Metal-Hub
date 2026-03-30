import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSupplierProductDto,
  SupplierQueryDto,
  UpsertSupplierProfileDto,
} from './dto/supplier.dto';
import {
  getFallbackSupplierById,
  getFallbackSuppliers,
} from '../marketplace/marketplace-fallback.data';

function getDateCutoff(dateFilter?: 'last-24h' | 'last-7d' | 'last-30d') {
  if (!dateFilter) return undefined;

  const now = new Date();
  const cutoff = new Date(now);

  if (dateFilter === 'last-24h') {
    cutoff.setHours(now.getHours() - 24);
    return cutoff;
  }

  if (dateFilter === 'last-7d') {
    cutoff.setDate(now.getDate() - 7);
    return cutoff;
  }

  cutoff.setDate(now.getDate() - 30);
  return cutoff;
}

function normalizeJsonArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  private buildSupplierWhere(query: SupplierQueryDto) {
    const params: any[] = [];
    const conditions: string[] = [];

    const addParam = (value: any) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (query.search) {
      const searchLike = addParam(`%${query.search.toLowerCase()}%`);
      const searchTs = addParam(query.search);
      conditions.push(`(
        LOWER(s.company_name) LIKE ${searchLike}
        OR LOWER(s.description) LIKE ${searchLike}
        OR EXISTS (
          SELECT 1 FROM supplier_products sps
          WHERE sps.supplier_id = s.id
          AND LOWER(sps.product_name) LIKE ${searchLike}
        )
        OR to_tsvector('english', COALESCE(s.company_name, '') || ' ' || COALESCE(s.description, '')) @@ plainto_tsquery('english', ${searchTs})
      )`);
    }

    if (query.location && query.location.length > 0) {
      const checks = query.location.map((location) => {
        const ref = addParam(`%${location.toLowerCase()}%`);
        return `LOWER(s.location) LIKE ${ref}`;
      });
      conditions.push(`(${checks.join(' OR ')})`);
    }

    const capabilityFilters = query.capability && query.capability.length > 0 ? query.capability : query.category;
    if (capabilityFilters && capabilityFilters.length > 0) {
      const refs = capabilityFilters.map((entry) => addParam(entry.toLowerCase()));
      conditions.push(`EXISTS (
        SELECT 1
        FROM supplier_capabilities sc
        JOIN capabilities c ON c.id = sc.capability_id
        WHERE sc.supplier_id = s.id
        AND LOWER(c.slug) IN (${refs.join(', ')})
      )`);
    }

    if (query.industry && query.industry.length > 0) {
      const refs = query.industry.map((entry) => addParam(entry.toLowerCase()));
      conditions.push(`EXISTS (
        SELECT 1
        FROM supplier_industries si
        JOIN industries i ON i.id = si.industry_id
        WHERE si.supplier_id = s.id
        AND LOWER(i.slug) IN (${refs.join(', ')})
      )`);
    }

    if (typeof query.verified === 'boolean') {
      conditions.push(`s.is_verified = ${query.verified ? 'TRUE' : 'FALSE'}`);
    }

    const cutoff = getDateCutoff(query.date);
    if (cutoff) {
      const cutoffRef = addParam(cutoff);
      conditions.push(`s.created_at >= ${cutoffRef}`);
    }

    if (query.moqRange) {
      if (query.moqRange === 'lt-100') {
        conditions.push(`EXISTS (
          SELECT 1 FROM supplier_products spm
          WHERE spm.supplier_id = s.id
          AND NULLIF(regexp_replace(spm.moq, '[^0-9]', '', 'g'), '')::int < 100
        )`);
      } else if (query.moqRange === '100-1000') {
        conditions.push(`EXISTS (
          SELECT 1 FROM supplier_products spm
          WHERE spm.supplier_id = s.id
          AND NULLIF(regexp_replace(spm.moq, '[^0-9]', '', 'g'), '')::int BETWEEN 100 AND 1000
        )`);
      } else {
        conditions.push(`EXISTS (
          SELECT 1 FROM supplier_products spm
          WHERE spm.supplier_id = s.id
          AND NULLIF(regexp_replace(spm.moq, '[^0-9]', '', 'g'), '')::int > 1000
        )`);
      }
    }

    return {
      whereSql: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
    };
  }

  async findAll(query: SupplierQueryDto) {
    try {
      await this.prisma.ensureConnection();

      const page = query.page || 1;
      const limit = Math.min(query.limit || 10, 20);
      const offset = (page - 1) * limit;

      const { whereSql, params } = this.buildSupplierWhere(query);

      const orderBySql =
        query.sortBy === 'verified'
          ? 's.is_verified DESC, s.rating DESC, s.created_at DESC'
          : query.sortBy === 'price'
            ? "COALESCE(MIN(NULLIF(regexp_replace(sp.price_range, '[^0-9.]', '', 'g'), '')::numeric), 999999999) ASC, s.created_at DESC"
            : query.sortBy === 'rating'
              ? 's.rating DESC, s.created_at DESC'
              : query.sortBy === 'response'
                ? 's.response_time_minutes ASC, s.created_at DESC'
                : query.sortBy === 'completion'
                  ? 's.completion_rate DESC, s.created_at DESC'
                  : 's.is_verified DESC, s.rating DESC, s.created_at DESC';

      const listSql = `
        SELECT
          s.id,
          s.company_name AS "companyName",
          s.tagline,
          s.description,
          s.location,
          s.is_verified AS "isVerified",
          s.iso_certified AS "isoCertified",
          s.export_ready AS "exportReady",
          s.response_time_minutes AS "responseTimeMinutes",
          s.completion_rate AS "completionRate",
          s.rating::float AS "rating",
          s.created_at AS "createdAt",
          COALESCE(
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'id', sp.id,
                'productName', sp.product_name,
                'category', sp.category,
                'material', sp.material,
                'priceRange', sp.price_range,
                'moq', sp.moq,
                'productionCapacity', sp.production_capacity
              )
            ) FILTER (WHERE sp.id IS NOT NULL),
            '[]'::json
          ) AS products,
          COALESCE((
            SELECT JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', c.id, 'name', c.name, 'slug', c.slug))
            FROM supplier_capabilities sc
            JOIN capabilities c ON c.id = sc.capability_id
            WHERE sc.supplier_id = s.id
          ), '[]'::json) AS capabilities,
          COALESCE((
            SELECT JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', i.id, 'name', i.name, 'slug', i.slug))
            FROM supplier_industries si
            JOIN industries i ON i.id = si.industry_id
            WHERE si.supplier_id = s.id
          ), '[]'::json) AS industries
        FROM suppliers s
        LEFT JOIN supplier_products sp ON sp.supplier_id = s.id
        ${whereSql}
        GROUP BY s.id
        ORDER BY ${orderBySql}
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `;

      const totalSql = `
        SELECT COUNT(*)::int AS total
        FROM suppliers s
        ${whereSql}
      `;

      const [rows, totalRows] = await Promise.all([
        this.prisma.$queryRawUnsafe(listSql, ...params, limit, offset),
        this.prisma.$queryRawUnsafe(totalSql, ...params),
      ]);

      const suppliers = (rows as any[]).map((row) => ({
        ...row,
        products: normalizeJsonArray(row.products),
        capabilities: normalizeJsonArray(row.capabilities),
        industries: normalizeJsonArray(row.industries),
      }));

      const total = Number((totalRows as any[])?.[0]?.total || 0);

      return {
        suppliers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    } catch {
      const fallback = getFallbackSuppliers(query as any);
      return {
        suppliers: fallback.rows,
        pagination: fallback.pagination,
      };
    }
  }

  async findOne(id: string) {
    try {
      await this.prisma.ensureConnection();

      const detailSql = `
        SELECT
          s.id,
          s.company_name AS "companyName",
          s.tagline,
          s.description,
          s.location,
          s.is_verified AS "isVerified",
          s.iso_certified AS "isoCertified",
          s.export_ready AS "exportReady",
          s.response_time_minutes AS "responseTimeMinutes",
          s.completion_rate AS "completionRate",
          s.rating::float AS "rating",
          s.created_at AS "createdAt",
          COALESCE(
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'id', sp.id,
                'productName', sp.product_name,
                'category', sp.category,
                'material', sp.material,
                'priceRange', sp.price_range,
                'moq', sp.moq,
                'productionCapacity', sp.production_capacity
              )
            ) FILTER (WHERE sp.id IS NOT NULL),
            '[]'::json
          ) AS products,
          COALESCE((
            SELECT JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', c.id, 'name', c.name, 'slug', c.slug))
            FROM supplier_capabilities sc
            JOIN capabilities c ON c.id = sc.capability_id
            WHERE sc.supplier_id = s.id
          ), '[]'::json) AS capabilities,
          COALESCE((
            SELECT JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', i.id, 'name', i.name, 'slug', i.slug))
            FROM supplier_industries si
            JOIN industries i ON i.id = si.industry_id
            WHERE si.supplier_id = s.id
          ), '[]'::json) AS industries
        FROM suppliers s
        LEFT JOIN supplier_products sp ON sp.supplier_id = s.id
        WHERE s.id = $1
        GROUP BY s.id
      `;

      const rows = (await this.prisma.$queryRawUnsafe(detailSql, id)) as any[];
      if (!rows.length) {
        throw new NotFoundException('Supplier not found');
      }

      const supplier = rows[0];
      return {
        ...supplier,
        products: normalizeJsonArray(supplier.products),
        capabilities: normalizeJsonArray(supplier.capabilities),
        industries: normalizeJsonArray(supplier.industries),
      };
    } catch {
      const fallback = getFallbackSupplierById(id);
      if (!fallback) {
        throw new NotFoundException('Supplier not found');
      }
      return fallback;
    }
  }

  async upsertProfile(user: any, dto: UpsertSupplierProfileDto) {
    await this.prisma.ensureConnection();

    if (user.role !== 'SELLER') {
      throw new ForbiddenException('Only suppliers can create supplier profiles');
    }

    const existing = await (this.prisma as any).supplier.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return (this.prisma as any).supplier.update({
        where: { id: existing.id },
        data: {
          companyName: dto.companyName,
          tagline: dto.tagline,
          description: dto.description,
          location: dto.location,
          isoCertified: dto.isoCertified ?? existing.isoCertified,
          exportReady: dto.exportReady ?? existing.exportReady,
        },
      });
    }

    return (this.prisma as any).supplier.create({
      data: {
        userId: user.id,
        companyName: dto.companyName,
        tagline: dto.tagline,
        description: dto.description,
        location: dto.location,
        isoCertified: dto.isoCertified ?? false,
        exportReady: dto.exportReady ?? false,
        isVerified: false,
      },
    });
  }

  async addProduct(user: any, dto: CreateSupplierProductDto) {
    await this.prisma.ensureConnection();

    if (user.role !== 'SELLER') {
      throw new ForbiddenException('Only suppliers can add product listings');
    }

    const supplier = await (this.prisma as any).supplier.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier profile not found. Create profile first.');
    }

    const slug = (dto.capabilitySlug || dto.category).toLowerCase();
    const capability = await (this.prisma as any).capability.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });

    const categoryRef = await (this.prisma as any).category.findFirst({
      where: {
        OR: [
          { slug: dto.category.toLowerCase() },
          { name: { equals: dto.category, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });

    const created = await (this.prisma as any).supplierProduct.create({
      data: {
        supplierId: supplier.id,
        capabilityId: capability?.id,
        categoryId: categoryRef?.id,
        category: capability?.slug || dto.category.toLowerCase(),
        productName: dto.productName,
        material: dto.material,
        priceRange: dto.priceRange,
        moq: dto.moq,
        productionCapacity: dto.productionCapacity,
      },
    });

    if (capability?.id) {
      await (this.prisma as any).productCapability.upsert({
        where: {
          productId_capabilityId: {
            productId: created.id,
            capabilityId: capability.id,
          },
        },
        create: {
          productId: created.id,
          capabilityId: capability.id,
        },
        update: {},
      });

      await (this.prisma as any).supplierCapability.upsert({
        where: {
          supplierId_capabilityId: {
            supplierId: supplier.id,
            capabilityId: capability.id,
          },
        },
        create: {
          supplierId: supplier.id,
          capabilityId: capability.id,
        },
        update: {},
      });
    }

    return created;
  }

  async getMyProfile(user: any) {
    await this.prisma.ensureConnection();

    return (this.prisma as any).supplier.findUnique({
      where: { userId: user.id },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
