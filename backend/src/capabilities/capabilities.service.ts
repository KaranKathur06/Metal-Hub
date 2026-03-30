import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  getFallbackCapabilities,
  getFallbackInquiryById,
} from '../marketplace/marketplace-fallback.data';

@Injectable()
export class CapabilitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly: boolean = true) {
    try {
      await this.prisma.ensureConnection();
      return (this.prisma as any).capability.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      });
    } catch {
      return getFallbackCapabilities(activeOnly);
    }
  }

  async findBySlug(slug: string) {
    try {
      await this.prisma.ensureConnection();
      const capability = await (this.prisma as any).capability.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              inquiries: true,
              supplierProducts: true,
            },
          },
        },
      });

      if (!capability || !capability.isActive) {
        throw new NotFoundException('Capability not found');
      }

      return capability;
    } catch {
      const fallback = getFallbackCapabilities(false).find((entry) => entry.slug === slug);
      if (!fallback || !fallback.isActive) {
        throw new NotFoundException('Capability not found');
      }

      const fallbackInquiry = getFallbackInquiryById('inq-1');
      return {
        ...fallback,
        _count: {
          inquiries: fallbackInquiry ? 35 : 0,
          supplierProducts: 70,
        },
      };
    }
  }

  async create(data: {
    name: string;
    slug: string;
    imageUrl: string;
    description: string;
    heroImageUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    isActive?: boolean;
    orderIndex?: number;
  }) {
    return (this.prisma as any).capability.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
        orderIndex: data.orderIndex ?? 0,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      imageUrl: string;
      description: string;
      heroImageUrl: string;
      heroTitle: string;
      heroSubtitle: string;
      isActive: boolean;
      orderIndex: number;
    }>,
  ) {
    return (this.prisma as any).capability.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await (this.prisma as any).capability.delete({
      where: { id },
    });

    return { message: 'Capability deleted successfully' };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        (this.prisma as any).capability.update({
          where: { id },
          data: { orderIndex: index + 1 },
        }),
      ),
    );

    return { message: 'Capabilities reordered successfully' };
  }
}
