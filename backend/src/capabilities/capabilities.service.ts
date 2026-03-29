import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CapabilitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly: boolean = true) {
    return (this.prisma as any).capability.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findBySlug(slug: string) {
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
