import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto, ListingQueryDto } from './dto/create-listing.dto';
import { ListingStatus, MetalType } from '@prisma/client';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateListingDto) {
    // Check user membership for listing limits
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!membership || membership.plan === 'FREE') {
      // Check listing count for free users
      const listingCount = await this.prisma.listing.count({
        where: {
          sellerId: userId,
          status: { in: ['PENDING', 'APPROVED'] },
        },
      });

      if (listingCount >= 3) {
        throw new ForbiddenException(
          'Free plan allows maximum 3 listings. Upgrade to create more.',
        );
      }
    }

    // Create listing
    const listing = await this.prisma.listing.create({
      data: {
        sellerId: userId,
        title: dto.title,
        description: dto.description,
        metalType: dto.metalType,
        listingRole: dto.listingRole,
        listingType: dto.listingType,
        premiumStatus: dto.premiumStatus,
        country: dto.location?.country,
        industries: dto.industries ?? [],
        capabilities: dto.capabilities ?? [],
        metals: dto.metals ?? [],
        grade: dto.grade,
        price: dto.price,
        isNegotiable: dto.isNegotiable ?? false,
        quantity: dto.quantity,
        unit: dto.unit || 'MT',
        location: dto.location,
        status: 'PENDING', // Requires admin approval
      },
    });

    // Add images if provided
    if (dto.imageUrls && dto.imageUrls.length > 0) {
      await this.prisma.listingImage.createMany({
        data: dto.imageUrls.map((url) => ({
          listingId: listing.id,
          imageUrl: url,
          mlVerified: false, // Will be updated after ML verification
        })),
      });
    }

    return this.findOne(listing.id);
  }

  async findAll(query: ListingQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED', // Only show approved listings
    };

    if (query.type === 'buyers') {
      where.listingRole = 'BUYER';
    } else if (query.type === 'suppliers') {
      where.listingRole = 'SUPPLIER';
    }

    if (query.country && query.country.length > 0) {
      where.country = { in: query.country };
    }

    if (query.industry && query.industry.length > 0) {
      where.industries = { hasSome: query.industry };
    }

    if (query.capability && query.capability.length > 0) {
      where.capabilities = { hasSome: query.capability };
    }

    if (query.metal && query.metal.length > 0) {
      where.metals = { hasSome: query.metal };
    }

    if (query.premium) {
      where.premiumStatus = query.premium;
    }

    if (query.listingType) {
      where.listingType = query.listingType;
    }

    if (query.dateRange) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - query.dateRange);
      where.createdAt = { gte: cutoff };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.metalType) {
      where.metalType = query.metalType;
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice) {
        where.price.lte = query.maxPrice;
      }
    }

    if (query.location) {
      where.location = {
        path: ['city', 'state'],
        string_contains: query.location,
      };
    }

    const orderBy: any = {};
    if (query.sortBy === 'price-low') {
      orderBy.price = 'asc';
    } else if (query.sortBy === 'price-high') {
      orderBy.price = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              phone: true,
              profile: {
                select: {
                  fullName: true,
                  companyName: true,
                  logoUrl: true,
                },
              },
            },
          },
          images: {
            take: 1,
            orderBy: { uploadedAt: 'asc' },
          },
          _count: {
            select: {
              chats: true,
              offers: true,
            },
          },
        },
      }),
      this.prisma.listing.count({ where }),
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

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            profile: true,
            memberships: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
          },
        },
        images: {
          orderBy: { uploadedAt: 'asc' },
        },
        _count: {
          select: {
            chats: true,
            offers: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async update(userId: string, id: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    if (listing.status === 'APPROVED') {
      // If approved, changes require re-approval
      await this.prisma.listing.update({
        where: { id },
        data: {
          ...dto,
          status: 'PENDING',
        },
      });
    } else {
      await this.prisma.listing.update({
        where: { id },
        data: dto,
      });
    }

    return this.findOne(id);
  }

  async delete(userId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    await this.prisma.listing.delete({
      where: { id },
    });

    return { message: 'Listing deleted successfully' };
  }

  async getMyListings(userId: string) {
    return this.prisma.listing.findMany({
      where: { sellerId: userId },
      include: {
        images: {
          take: 1,
        },
        _count: {
          select: {
            chats: true,
            offers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

