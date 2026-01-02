import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async createOffer(userId: string, listingId: string, dto: CreateOfferDto) {
    // Verify listing exists and is approved
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== 'APPROVED') {
      throw new BadRequestException('Listing is not available for offers');
    }

    if (listing.sellerId === userId) {
      throw new BadRequestException('Cannot make offer on your own listing');
    }

    // Check if negotiable
    if (!listing.isNegotiable) {
      throw new BadRequestException('This listing does not accept offers');
    }

    // Create offer
    const offer = await this.prisma.offer.create({
      data: {
        listingId,
        buyerId: userId,
        offerPrice: dto.offerPrice,
        status: 'PENDING',
      },
      include: {
        buyer: {
          include: { profile: true },
        },
        listing: {
          include: {
            images: { take: 1 },
          },
        },
      },
    });

    return offer;
  }

  async getListingOffers(listingId: string, userId: string) {
    // Verify user owns the listing
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.offer.findMany({
      where: { listingId },
      include: {
        buyer: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyOffers(userId: string) {
    return this.prisma.offer.findMany({
      where: { buyerId: userId },
      include: {
        listing: {
          include: {
            images: { take: 1 },
            seller: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptOffer(offerId: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.listing.sellerId !== userId) {
      throw new ForbiddenException('Only listing owner can accept offers');
    }

    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Offer is not pending');
    }

    // Update offer status
    await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    });

    // Reject other pending offers for this listing
    await this.prisma.offer.updateMany({
      where: {
        listingId: offer.listingId,
        id: { not: offerId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    });

    return { message: 'Offer accepted successfully' };
  }

  async rejectOffer(offerId: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.listing.sellerId !== userId) {
      throw new ForbiddenException('Only listing owner can reject offers');
    }

    await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' },
    });

    return { message: 'Offer rejected' };
  }
}

