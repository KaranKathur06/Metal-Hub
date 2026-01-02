import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto, SendMessageDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChat(userId: string, dto: CreateChatDto) {
    // Verify listing exists
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { seller: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId === userId) {
      throw new BadRequestException('Cannot chat with yourself');
    }

    // Check if chat already exists
    const existingChat = await this.prisma.chat.findUnique({
      where: {
        listingId_buyerId: {
          listingId: dto.listingId,
          buyerId: userId,
        },
      },
    });

    if (existingChat) {
      return this.getChat(existingChat.id, userId);
    }

    // Create new chat
    const chat = await this.prisma.chat.create({
      data: {
        listingId: dto.listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
      },
      include: {
        listing: true,
        buyer: {
          include: { profile: true },
        },
        seller: {
          include: { profile: true },
        },
      },
    });

    // Send initial message if provided
    if (dto.initialMessage) {
      await this.sendMessage(chat.id, userId, { message: dto.initialMessage });
    }

    return this.getChat(chat.id, userId);
  }

  async getChat(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        listing: {
          include: {
            images: { take: 1 },
          },
        },
        buyer: {
          include: { profile: true },
        },
        seller: {
          include: { profile: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return chat;
  }

  async getUserChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        listing: {
          include: {
            images: { take: 1 },
          },
        },
        buyer: {
          include: { profile: true },
        },
        seller: {
          include: { profile: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async sendMessage(chatId: string, senderId: string, dto: SendMessageDto) {
    // Verify chat exists and user has access
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.buyerId !== senderId && chat.sellerId !== senderId) {
      throw new ForbiddenException('Access denied');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId,
        message: dto.message,
      },
    });

    // Update chat last message time
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }
}

