import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, ListingStatus, UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user?.role === UserRole.ADMIN;
  }

  async requireAdmin(userId: string) {
    if (!(await this.isAdmin(userId))) {
      throw new ForbiddenException('Admin access required');
    }
  }

  async logAdminAction(adminId: string, action: string, targetId?: string, metadata?: any) {
    return this.prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetId,
        metadata,
      },
    });
  }

  // User Management
  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          profile: true,
          memberships: {
            where: { status: 'ACTIVE' },
            take: 1,
          },
          _count: {
            select: {
              listings: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async banUser(adminId: string, userId: string) {
    await this.requireAdmin(adminId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BANNED },
    });

    await this.logAdminAction(adminId, 'BAN_USER', userId);

    return { message: 'User banned successfully' };
  }

  async suspendUser(adminId: string, userId: string) {
    await this.requireAdmin(adminId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED },
    });

    await this.logAdminAction(adminId, 'SUSPEND_USER', userId);

    return { message: 'User suspended successfully' };
  }

  // Listing Management
  async getPendingListings(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        include: {
          seller: {
            include: { profile: true },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveListing(adminId: string, listingId: string) {
    await this.requireAdmin(adminId);

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.APPROVED },
    });

    await this.logAdminAction(adminId, 'APPROVE_LISTING', listingId);

    return { message: 'Listing approved successfully' };
  }

  async rejectListing(adminId: string, listingId: string, reason?: string) {
    await this.requireAdmin(adminId);

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.REJECTED },
    });

    await this.logAdminAction(adminId, 'REJECT_LISTING', listingId, { reason });

    return { message: 'Listing rejected' };
  }

  async featureListing(adminId: string, listingId: string, days: number = 7) {
    await this.requireAdmin(adminId);

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + days);

    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        isFeatured: true,
        featuredUntil,
      },
    });

    await this.logAdminAction(adminId, 'FEATURE_LISTING', listingId, { days });

    return { message: 'Listing featured successfully' };
  }

  // Banner Management
  async getBanners() {
    return (this.prisma as any).banner.findMany({
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createBanner(adminId: string, payload: any) {
    await this.requireAdmin(adminId);

    const banner = await (this.prisma as any).banner.create({
      data: {
        title: payload.title,
        subtitle: payload.subtitle,
        imageUrl: payload.imageUrl,
        ctaText: payload.ctaText,
        ctaLink: payload.ctaLink,
        isActive: payload.isActive ?? true,
        orderIndex: payload.orderIndex ?? 0,
      },
    });

    await this.logAdminAction(adminId, 'CREATE_BANNER', banner.id);
    return banner;
  }

  async updateBanner(adminId: string, id: string, payload: any) {
    await this.requireAdmin(adminId);

    const banner = await (this.prisma as any).banner.update({
      where: { id },
      data: payload,
    });

    await this.logAdminAction(adminId, 'UPDATE_BANNER', id);
    return banner;
  }

  async deleteBanner(adminId: string, id: string) {
    await this.requireAdmin(adminId);

    await (this.prisma as any).banner.delete({ where: { id } });
    await this.logAdminAction(adminId, 'DELETE_BANNER', id);

    return { message: 'Banner deleted successfully' };
  }

  async reorderBanners(adminId: string, ids: string[]) {
    await this.requireAdmin(adminId);

    await this.prisma.$transaction(
      ids.map((id, index) =>
        (this.prisma as any).banner.update({
          where: { id },
          data: { orderIndex: index + 1 },
        }),
      ),
    );

    await this.logAdminAction(adminId, 'REORDER_BANNERS', undefined, { ids });
    return { message: 'Banners reordered successfully' };
  }

  // Capability Management
  async getCapabilities() {
    return (this.prisma as any).capability.findMany({
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createCapability(adminId: string, payload: any) {
    await this.requireAdmin(adminId);

    const capability = await (this.prisma as any).capability.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        imageUrl: payload.imageUrl,
        description: payload.description,
        heroImageUrl: payload.heroImageUrl,
        heroTitle: payload.heroTitle,
        heroSubtitle: payload.heroSubtitle,
        isActive: payload.isActive ?? true,
        orderIndex: payload.orderIndex ?? 0,
      },
    });

    await this.logAdminAction(adminId, 'CREATE_CAPABILITY', capability.id);
    return capability;
  }

  async updateCapability(adminId: string, id: string, payload: any) {
    await this.requireAdmin(adminId);

    const capability = await (this.prisma as any).capability.update({
      where: { id },
      data: payload,
    });

    await this.logAdminAction(adminId, 'UPDATE_CAPABILITY', id);
    return capability;
  }

  async deleteCapability(adminId: string, id: string) {
    await this.requireAdmin(adminId);

    await (this.prisma as any).capability.delete({ where: { id } });
    await this.logAdminAction(adminId, 'DELETE_CAPABILITY', id);

    return { message: 'Capability deleted successfully' };
  }

  async reorderCapabilities(adminId: string, ids: string[]) {
    await this.requireAdmin(adminId);

    await this.prisma.$transaction(
      ids.map((id, index) =>
        (this.prisma as any).capability.update({
          where: { id },
          data: { orderIndex: index + 1 },
        }),
      ),
    );

    await this.logAdminAction(adminId, 'REORDER_CAPABILITIES', undefined, { ids });
    return { message: 'Capabilities reordered successfully' };
  }

  // Supplier Verification
  async getPendingSuppliers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      (this.prisma as any).supplier.findMany({
        where: { isVerified: false },
        skip,
        take: limit,
        include: {
          products: true,
          owner: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).supplier.count({ where: { isVerified: false } }),
    ]);

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

  async approveSupplier(adminId: string, supplierId: string) {
    await this.requireAdmin(adminId);

    const supplier = await (this.prisma as any).supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const updated = await (this.prisma as any).supplier.update({
      where: { id: supplierId },
      data: { isVerified: true },
    });

    await this.logAdminAction(adminId, 'APPROVE_SUPPLIER', supplierId);
    return updated;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [
      totalUsers,
      totalListings,
      pendingListings,
      activeMemberships,
      recentPayments,
      pendingSuppliers,
      totalBanners,
      totalCapabilities,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: 'PENDING' } }),
      this.prisma.membership.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { include: { profile: true } } },
      }),
      (this.prisma as any).supplier.count({ where: { isVerified: false } }),
      (this.prisma as any).banner.count(),
      (this.prisma as any).capability.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers,
      totalListings,
      pendingListings,
      activeMemberships,
      pendingSuppliers,
      totalBanners,
      totalCapabilities,
      recentPayments,
    };
  }
}
