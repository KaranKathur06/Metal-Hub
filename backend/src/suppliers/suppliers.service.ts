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

function parseFirstNumber(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const match = value.match(/[\d,.]+/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number.parseFloat(match[0].replace(/,/g, ''));
}

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  private toSupplierResponse(supplier: any) {
    return {
      id: supplier.id,
      companyName: supplier.companyName,
      tagline: supplier.tagline,
      description: supplier.description,
      location: supplier.location,
      isVerified: supplier.isVerified,
      isoCertified: supplier.isoCertified,
      exportReady: supplier.exportReady,
      responseTimeMinutes: supplier.responseTimeMinutes,
      completionRate: supplier.completionRate,
      rating:
        typeof supplier.rating === 'object' && supplier.rating !== null
          ? Number(supplier.rating.toString())
          : Number(supplier.rating || 0),
      createdAt: supplier.createdAt,
      capabilities: (supplier.capabilityLinks || [])
        .map((entry: any) => entry.capability)
        .filter(Boolean),
      industries: (supplier.industryLinks || [])
        .map((entry: any) => entry.industry)
        .filter(Boolean),
      products: (supplier.products || []).map((product: any) => ({
        ...product,
        keywords: product.keywords || [],
        applications: product.applications || [],
        industries: product.industries || [],
      })),
    };
  }

  async findAll(query: SupplierQueryDto) {
    try {
      await this.prisma.ensureConnection();

      // eslint-disable-next-line no-console
      console.log('[Marketplace Suppliers] Filters:', query);

      const page = query.page || 1;
      const limit = Math.min(query.limit || 10, 20);
      const offset = (page - 1) * limit;

      const where: any = {};
      const andConditions: any[] = [];

      if (query.search) {
        const normalized = query.search.toLowerCase().trim();
        const tokens = normalized.split(/\s+/).filter(Boolean);

        andConditions.push({
          OR: [
            { companyName: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            {
              products: {
                some: {
                  productName: { contains: query.search, mode: 'insensitive' },
                },
              },
            },
            {
              products: {
                some: {
                  material: { contains: query.search, mode: 'insensitive' },
                },
              },
            },
            {
              products: {
                some: {
                  keywords: { has: normalized },
                },
              },
            },
            ...(tokens.length > 0
              ? [
                  {
                    products: {
                      some: {
                        keywords: { hasSome: tokens },
                      },
                    },
                  },
                  {
                    products: {
                      some: {
                        applications: { hasSome: tokens },
                      },
                    },
                  },
                  {
                    products: {
                      some: {
                        industries: { hasSome: tokens },
                      },
                    },
                  },
                ]
              : []),
          ],
        });
      }

      if (query.location && query.location.length > 0) {
        andConditions.push({
          OR: query.location.map((location) => ({
            location: { contains: location, mode: 'insensitive' },
          })),
        });
      }

      const capabilityFilters =
        query.capability && query.capability.length > 0
          ? query.capability
          : query.category;
      if (capabilityFilters && capabilityFilters.length > 0) {
        andConditions.push({
          capabilityLinks: {
            some: {
              capability: {
                slug: {
                  in: capabilityFilters.map((item) => item.toLowerCase()),
                },
              },
            },
          },
        });
      }

      if (query.industry && query.industry.length > 0) {
        andConditions.push({
          industryLinks: {
            some: {
              industry: {
                slug: {
                  in: query.industry.map((item) => item.toLowerCase()),
                },
              },
            },
          },
        });
      }

      if (typeof query.verified === 'boolean') {
        andConditions.push({ isVerified: query.verified });
      }

      const cutoff = getDateCutoff(query.date);
      if (cutoff) {
        andConditions.push({ createdAt: { gte: cutoff } });
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      const orderBy: any[] =
        query.sortBy === 'verified'
          ? [{ isVerified: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }]
          : query.sortBy === 'rating'
            ? [{ rating: 'desc' }, { createdAt: 'desc' }]
            : query.sortBy === 'response'
              ? [{ responseTimeMinutes: 'asc' }, { createdAt: 'desc' }]
              : query.sortBy === 'completion'
                ? [{ completionRate: 'desc' }, { createdAt: 'desc' }]
                : [{ isVerified: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }];

      const [rows, total] = await Promise.all([
        (this.prisma as any).supplier.findMany({
          where,
          include: {
            capabilityLinks: { include: { capability: true } },
            industryLinks: { include: { industry: true } },
            products: {
              orderBy: [{ createdAt: 'desc' }],
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        (this.prisma as any).supplier.count({ where }),
      ]);

      let suppliers = rows.map((row: any) => this.toSupplierResponse(row));

      if (query.sortBy === 'price') {
        suppliers = [...suppliers].sort((a, b) => {
          const aMin = Math.min(
            ...(a.products || []).map((p: any) => parseFirstNumber(p.priceRange)),
          );
          const bMin = Math.min(
            ...(b.products || []).map((p: any) => parseFirstNumber(p.priceRange)),
          );
          return aMin - bMin;
        });
      }

      if (query.moqRange) {
        suppliers = suppliers.filter((supplier: any) => {
          const values = (supplier.products || []).map((p: any) =>
            parseFirstNumber(p.moq),
          );
          if (query.moqRange === 'lt-100') return values.some((v: number) => v < 100);
          if (query.moqRange === '100-1000') {
            return values.some((v: number) => v >= 100 && v <= 1000);
          }
          return values.some((v: number) => v > 1000);
        });
      }

      // eslint-disable-next-line no-console
      console.log('[Marketplace Suppliers] Results count:', suppliers.length);

      return {
        suppliers,
        pagination: {
          page,
          limit,
          total: query.moqRange ? suppliers.length : total,
          totalPages: Math.max(1, Math.ceil((query.moqRange ? suppliers.length : total) / limit)),
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

      const supplier = await (this.prisma as any).supplier.findUnique({
        where: { id },
        include: {
          capabilityLinks: { include: { capability: true } },
          industryLinks: { include: { industry: true } },
          products: {
            orderBy: [{ createdAt: 'desc' }],
          },
        },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }

      return this.toSupplierResponse(supplier);
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

