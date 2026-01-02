import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
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

  // Dashboard Stats
  async getDashboardStats() {
    const [
      totalUsers,
      totalListings,
      pendingListings,
      activeMemberships,
      recentPayments,
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
    ]);

    return {
      totalUsers,
      totalListings,
      pendingListings,
      activeMemberships,
      recentPayments,
    };
  }
}

