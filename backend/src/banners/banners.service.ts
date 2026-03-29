import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly: boolean = true) {
    return (this.prisma as any).banner.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(data: {
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    isActive?: boolean;
    orderIndex?: number;
  }) {
    return (this.prisma as any).banner.create({
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
      title: string;
      subtitle: string;
      imageUrl: string;
      ctaText: string;
      ctaLink: string;
      isActive: boolean;
      orderIndex: number;
    }>,
  ) {
    return (this.prisma as any).banner.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await (this.prisma as any).banner.delete({
      where: { id },
    });
    return { message: 'Banner deleted successfully' };
  }

  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        (this.prisma as any).banner.update({
          where: { id },
          data: { orderIndex: index + 1 },
        }),
      ),
    );
    return { message: 'Banners reordered successfully' };
  }
}

