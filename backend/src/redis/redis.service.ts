import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
  }

  async onModuleInit() {
    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // OTP Methods
  async setOTP(phone: string, otp: string, expiryMinutes: number = 10): Promise<void> {
    const key = `otp:${phone}`;
    await this.client.setex(key, expiryMinutes * 60, otp);
  }

  async getOTP(phone: string): Promise<string | null> {
    const key = `otp:${phone}`;
    return await this.client.get(key);
  }

  async deleteOTP(phone: string): Promise<void> {
    const key = `otp:${phone}`;
    await this.client.del(key);
  }

  // Rate Limiting
  async incrementLoginAttempts(ip: string, windowMs: number = 900000): Promise<number> {
    const key = `login_attempts:${ip}`;
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.pexpire(key, windowMs);
    }
    return count;
  }

  async getLoginAttempts(ip: string): Promise<number> {
    const key = `login_attempts:${ip}`;
    const count = await this.client.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  async resetLoginAttempts(ip: string): Promise<void> {
    const key = `login_attempts:${ip}`;
    await this.client.del(key);
  }

  // Trial Tracking
  async setTrialUsed(deviceHash: string): Promise<void> {
    const key = `trial_used:${deviceHash}`;
    await this.client.set(key, '1');
  }

  async hasTrialBeenUsed(deviceHash: string): Promise<boolean> {
    const key = `trial_used:${deviceHash}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  // Session Blacklist
  async blacklistToken(token: string, expirySeconds: number): Promise<void> {
    const key = `session_blacklist:${token}`;
    await this.client.setex(key, expirySeconds, '1');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `session_blacklist:${token}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  // Generic Redis methods
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (expirySeconds) {
      await this.client.setex(key, expirySeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  getClient(): Redis {
    return this.client;
  }
}

