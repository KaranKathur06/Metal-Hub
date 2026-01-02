import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipPlan } from '@prisma/client';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async getCurrentMembership(userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!membership) {
      // Create free membership if none exists
      return this.prisma.membership.create({
        data: {
          userId,
          plan: 'FREE',
        },
      });
    }

    // Check if expired
    if (membership.endDate && new Date() > membership.endDate) {
      await this.prisma.membership.update({
        where: { id: membership.id },
        data: { status: 'EXPIRED' },
      });

      // Create new free membership
      return this.prisma.membership.create({
        data: {
          userId,
          plan: 'FREE',
        },
      });
    }

    return membership;
  }

  async upgradeMembership(userId: string, plan: MembershipPlan, endDate: Date) {
    // Cancel current active membership
    await this.prisma.membership.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: { status: 'CANCELLED' },
    });

    // Create new membership
    return this.prisma.membership.create({
      data: {
        userId,
        plan,
        endDate,
        status: 'ACTIVE',
      },
    });
  }

  async checkMembershipLimits(userId: string) {
    const membership = await this.getCurrentMembership(userId);

    const limits = {
      FREE: {
        maxListings: 3,
        canFeature: false,
        canNegotiate: true,
        maxImagesPerListing: 3,
      },
      SILVER: {
        maxListings: Infinity,
        canFeature: true,
        featuredCount: 1,
        canNegotiate: true,
        maxImagesPerListing: 5,
      },
      GOLD: {
        maxListings: Infinity,
        canFeature: true,
        featuredCount: Infinity,
        canNegotiate: true,
        maxImagesPerListing: 10,
      },
    };

    return limits[membership.plan];
  }
}

