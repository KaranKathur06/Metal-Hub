import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSupplierProductDto,
  SupplierQueryDto,
  UpsertSupplierProfileDto,
} from './dto/supplier.dto';

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

function normalizeProducts(products: unknown) {
  if (Array.isArray(products)) return products;
  if (typeof products === 'string') {
    try {
      return JSON.parse(products);
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
      const searchParam = addParam(`%${query.search.toLowerCase()}%`);
      conditions.push(
        `(LOWER(s.company_name) LIKE ${searchParam} OR LOWER(s.description) LIKE ${searchParam} OR EXISTS (SELECT 1 FROM supplier_products sps WHERE sps.supplier_id = s.id AND LOWER(sps.product_name) LIKE ${searchParam}))`,
      );
    }

    if (query.location && query.location.length > 0) {
      const locationChecks = query.location.map((location) => {
        const ref = addParam(`%${location.toLowerCase()}%`);
        return `LOWER(s.location) LIKE ${ref}`;
      });
      conditions.push(`(${locationChecks.join(' OR ')})`);
    }

    if (query.category && query.category.length > 0) {
      const refs = query.category.map((category) => addParam(category.toLowerCase()));
      conditions.push(
        `EXISTS (SELECT 1 FROM supplier_products spc WHERE spc.supplier_id = s.id AND LOWER(spc.category) IN (${refs.join(', ')}))`,
      );
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
        conditions.push(
          `EXISTS (SELECT 1 FROM supplier_products spm WHERE spm.supplier_id = s.id AND NULLIF(regexp_replace(spm.moq, '[^0-9]', '', 'g'), '')::int < 100)`,
        );
      } else if (query.moqRange === '100-1000') {
        conditions.push(
          `EXISTS (SELECT 1 FROM supplier_products spm WHERE spm.supplier_id = s.id AND NULLIF(regexp_replace(spm.moq, '[^0-9]', '', 'g'), '')::int BETWEEN 100 AND 1000)`,
        );
      } else {
        conditions.push(
          `EXISTS (SELECT 1 FROM supplier_products spm WHERE spm.supplier_id = s.id AND NULLIF(regexp_replace(spm.moq, '[^0-9]', '', 'g'), '')::int > 1000)`,
        );
      }
    }

    return {
      whereSql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
    };
  }

  async findAll(query: SupplierQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 20);
    const offset = (page - 1) * limit;

    const { whereSql, params } = this.buildSupplierWhere(query);

    const orderBySql =
      query.sortBy === 'verified'
        ? 's.is_verified DESC, s.created_at DESC'
        : query.sortBy === 'price'
          ? "COALESCE(MIN(NULLIF(regexp_replace(sp.price_range, '[^0-9.]', '', 'g'), '')::numeric), 999999999) ASC, s.created_at DESC"
          : query.sortBy === 'rating'
            ? 's.rating DESC, s.created_at DESC'
            : 's.created_at DESC';

    const listSql = `
      SELECT
        s.id,
        s.company_name AS "companyName",
        s.description,
        s.location,
        s.is_verified AS "isVerified",
        s.rating::float AS "rating",
        s.created_at AS "createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', sp.id,
              'productName', sp.product_name,
              'category', sp.category,
              'priceRange', sp.price_range,
              'moq', sp.moq,
              'productionCapacity', sp.production_capacity
            )
            ORDER BY sp.created_at DESC
          ) FILTER (WHERE sp.id IS NOT NULL),
          '[]'::json
        ) AS products
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
      products: normalizeProducts(row.products),
    }));

    const total = Number((totalRows as any[])?.[0]?.total || 0);

    return {
      suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const detailSql = `
      SELECT
        s.id,
        s.company_name AS "companyName",
        s.description,
        s.location,
        s.is_verified AS "isVerified",
        s.rating::float AS "rating",
        s.created_at AS "createdAt",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', sp.id,
              'productName', sp.product_name,
              'category', sp.category,
              'priceRange', sp.price_range,
              'moq', sp.moq,
              'productionCapacity', sp.production_capacity
            )
            ORDER BY sp.created_at DESC
          ) FILTER (WHERE sp.id IS NOT NULL),
          '[]'::json
        ) AS products
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
      products: normalizeProducts(supplier.products),
    };
  }

  async upsertProfile(user: any, dto: UpsertSupplierProfileDto) {
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
          description: dto.description,
          location: dto.location,
        },
      });
    }

    return (this.prisma as any).supplier.create({
      data: {
        userId: user.id,
        companyName: dto.companyName,
        description: dto.description,
        location: dto.location,
        isVerified: false,
      },
    });
  }

  async addProduct(user: any, dto: CreateSupplierProductDto) {
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

    return (this.prisma as any).supplierProduct.create({
      data: {
        supplierId: supplier.id,
        capabilityId: capability?.id,
        category: capability?.slug || dto.category.toLowerCase(),
        productName: dto.productName,
        priceRange: dto.priceRange,
        moq: dto.moq,
        productionCapacity: dto.productionCapacity,
      },
    });
  }

  async getMyProfile(user: any) {
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
