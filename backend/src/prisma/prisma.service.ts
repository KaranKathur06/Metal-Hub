import { Injectable, OnModuleInit, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private connected = false;

  async ensureConnection() {
    if (this.connected) return;

    try {
      await this.$connect();
      this.connected = true;
    } catch (error) {
      throw new ServiceUnavailableException(
        'Database is currently unavailable. Please verify DATABASE_URL and network connectivity.',
      );
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
    } catch (error) {
      this.connected = false;
      console.error('[Prisma] Initial connection failed. Continuing in degraded mode.', error);
    }
  }

  async onModuleDestroy() {
    if (!this.connected) return;
    await this.$disconnect();
  }
}

