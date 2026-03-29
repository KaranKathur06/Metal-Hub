import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private isAvailable = false;

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    this.client.on('connect', () => {
      this.isAvailable = true;
      console.log('Redis connected');
    });

    this.client.on('error', (error) => {
      this.isAvailable = false;
      console.error('Redis error:', error?.message || error);
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.isAvailable = true;
    } catch {
      this.isAvailable = false;
      console.error('Redis unavailable. Running in no-cache mode.');
    }
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }

  // OTP Methods
  async setOTP(phone: string, otp: string, expiryMinutes: number = 10): Promise<void> {
    if (!this.isAvailable) return;
    await this.client.setex(`otp:${phone}`, expiryMinutes * 60, otp);
  }

  async getOTP(phone: string): Promise<string | null> {
    if (!this.isAvailable) return null;
    return this.client.get(`otp:${phone}`);
  }

  async deleteOTP(phone: string): Promise<void> {
    if (!this.isAvailable) return;
    await this.client.del(`otp:${phone}`);
  }

  // Rate Limiting
  async incrementLoginAttempts(ip: string, windowMs: number = 900000): Promise<number> {
    if (!this.isAvailable) return 0;
    const key = `login_attempts:${ip}`;
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.pexpire(key, windowMs);
    }
    return count;
  }

  async getLoginAttempts(ip: string): Promise<number> {
    if (!this.isAvailable) return 0;
    const count = await this.client.get(`login_attempts:${ip}`);
    return count ? Number.parseInt(count, 10) : 0;
  }

  async resetLoginAttempts(ip: string): Promise<void> {
    if (!this.isAvailable) return;
    await this.client.del(`login_attempts:${ip}`);
  }

  // Trial Tracking
  async setTrialUsed(deviceHash: string): Promise<void> {
    if (!this.isAvailable) return;
    await this.client.set(`trial_used:${deviceHash}`, '1');
  }

  async hasTrialBeenUsed(deviceHash: string): Promise<boolean> {
    if (!this.isAvailable) return false;
    const exists = await this.client.exists(`trial_used:${deviceHash}`);
    return exists === 1;
  }

  // Session Blacklist
  async blacklistToken(token: string, expirySeconds: number): Promise<void> {
    if (!this.isAvailable) return;
    await this.client.setex(`session_blacklist:${token}`, expirySeconds, '1');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!this.isAvailable) return false;
    const exists = await this.client.exists(`session_blacklist:${token}`);
    return exists === 1;
  }

  // Generic Redis Methods
  async get(key: string): Promise<string | null> {
    if (!this.isAvailable) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (!this.isAvailable) return;
    if (expirySeconds) {
      await this.client.setex(key, expirySeconds, value);
      return;
    }
    await this.client.set(key, value);
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable) return;
    await this.client.del(key);
  }

  getClient(): Redis {
    return this.client;
  }
}
