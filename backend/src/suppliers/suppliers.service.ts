import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSupplierProductDto,
  SupplierQueryDto,
  UpsertSupplierProfileDto,
} from './dto/supplier.dto';

function extractMinPrice(value?: string): number {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const match = value.match(/[\d,.]+/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[0].replace(/,/g, '')) || Number.MAX_SAFE_INTEGER;
}

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: SupplierQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 20);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        {
          products: {
            some: {
              productName: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.category) {
      where.products = {
        some: {
          capability: {
            slug: query.category,
          },
        },
      };
    }

    const orderBy: any[] = [{ createdAt: 'desc' }];
    if (query.sortBy === 'verified') {
      orderBy.unshift({ isVerified: 'desc' });
    }

    const [suppliers, total] = await Promise.all([
      (this.prisma as any).supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          products: {
            include: {
              capability: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          owner: {
            select: {
              id: true,
              role: true,
              profile: {
                select: {
                  fullName: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      }),
      (this.prisma as any).supplier.count({ where }),
    ]);

    const sorted =
      query.sortBy === 'price'
        ? [...suppliers].sort((a, b) => {
            const aMin = Math.min(...(a.products || []).map((p) => extractMinPrice(p.priceRange)), Number.MAX_SAFE_INTEGER);
            const bMin = Math.min(...(b.products || []).map((p) => extractMinPrice(p.priceRange)), Number.MAX_SAFE_INTEGER);
            return aMin - bMin;
          })
        : suppliers;

    return {
      suppliers: sorted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
      select: { id: true, isVerified: true },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier profile not found. Create profile first.');
    }

    let capabilityId: string | undefined;
    if (dto.category) {
      const capability = await (this.prisma as any).capability.findUnique({
        where: { slug: dto.category },
        select: { id: true },
      });
      capabilityId = capability?.id;
    }

    return (this.prisma as any).supplierProduct.create({
      data: {
        supplierId: supplier.id,
        capabilityId,
        productName: dto.productName,
        priceRange: dto.priceRange,
        moq: dto.moq,
      },
    });
  }

  async getMyProfile(user: any) {
    return (this.prisma as any).supplier.findUnique({
      where: { userId: user.id },
      include: {
        products: {
          include: {
            capability: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
