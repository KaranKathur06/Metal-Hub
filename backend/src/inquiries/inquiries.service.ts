import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto, InquiryQueryDto } from './dto/inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: InquiryQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 20);
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

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.category) {
      where.capability = {
        slug: query.category,
      };
    }

    let orderBy: any = [{ createdAt: 'desc' }];

    if (query.sortBy === 'price') {
      orderBy = [{ budget: 'desc' }, { createdAt: 'desc' }];
    }

    if (query.sortBy === 'verified') {
      orderBy = [{ createdAt: 'desc' }];
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

  async create(user: any, dto: CreateInquiryDto) {
    if (user.role !== 'BUYER') {
      throw new ForbiddenException('Only buyers can post inquiries');
    }

    let capabilityId: string | undefined;

    if (dto.category) {
      const capability = await (this.prisma as any).capability.findUnique({
        where: { slug: dto.category },
        select: { id: true },
      });
      capabilityId = capability?.id;
    }

    return (this.prisma as any).inquiry.create({
      data: {
        userId: user.id,
        productName: dto.productName,
        description: dto.description,
        quantity: dto.quantity,
        budget: dto.budget,
        location: dto.location,
        capabilityId,
        status: 'OPEN',
      },
      include: {
        capability: true,
      },
    });
  }
}
