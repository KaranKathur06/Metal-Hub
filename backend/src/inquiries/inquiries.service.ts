import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto, InquiryQueryDto } from './dto/inquiry.dto';

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

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: InquiryQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 20);
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'OPEN',
    };

    if (query.search) {
      where.OR = [
        { productName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.location && query.location.length > 0) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: query.location.map((location) => ({
            location: { contains: location, mode: 'insensitive' },
          })),
        },
      ];
    }

    if (query.category && query.category.length > 0) {
      where.category = {
        in: query.category.map((item) => item.toLowerCase()),
      };
    }

    if (typeof query.verified === 'boolean') {
      where.buyer = {
        profile: {
          kycStatus: query.verified ? 'VERIFIED' : { not: 'VERIFIED' },
        },
      };
    }

    const cutoff = getDateCutoff(query.date);
    if (cutoff) {
      where.createdAt = { gte: cutoff };
    }

    const orderBy: any[] = [{ createdAt: 'desc' }];
    if (query.sortBy === 'price') {
      orderBy.unshift({ budget: 'desc' });
    }

    const [inquiries, total] = await Promise.all([
      (this.prisma as any).inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          capability: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          buyer: {
            select: {
              id: true,
              role: true,
              profile: {
                select: {
                  fullName: true,
                  companyName: true,
                  kycStatus: true,
                },
              },
            },
          },
        },
      }),
      (this.prisma as any).inquiry.count({ where }),
    ]);

    const sorted =
      query.sortBy === 'verified'
        ? [...inquiries].sort((a, b) => {
            const aVerified = a?.buyer?.profile?.kycStatus === 'VERIFIED' ? 1 : 0;
            const bVerified = b?.buyer?.profile?.kycStatus === 'VERIFIED' ? 1 : 0;
            if (aVerified !== bVerified) return bVerified - aVerified;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
        : inquiries;

    return {
      inquiries: sorted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const inquiry = await (this.prisma as any).inquiry.findUnique({
      where: { id },
      include: {
        capability: true,
        buyer: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    return inquiry;
  }

  async create(user: any, dto: CreateInquiryDto) {
    if (user.role !== 'BUYER') {
      throw new ForbiddenException('Only buyers can post inquiries');
    }

    const normalizedCategory = dto.category.toLowerCase();

    const capability = await (this.prisma as any).capability.findFirst({
      where: {
        OR: [{ slug: normalizedCategory }, { name: { equals: dto.category, mode: 'insensitive' } }],
      },
      select: { id: true, slug: true },
    });

    const budgetRange =
      dto.budgetRange ||
      (typeof dto.budget === 'number' ? `Approx INR ${Math.round(dto.budget).toLocaleString('en-IN')}` : 'Open');

    return (this.prisma as any).inquiry.create({
      data: {
        userId: user.id,
        productName: dto.productName,
        description: dto.description,
        quantity: dto.quantity,
        budget: dto.budget,
        budgetRange,
        location: dto.location,
        category: capability?.slug || normalizedCategory,
        capabilityId: capability?.id,
        urgency: dto.urgency || 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        capability: true,
      },
    });
  }
}
