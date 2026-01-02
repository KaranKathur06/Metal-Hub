import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private redis: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${ip}`;
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

    const count = await this.redis.getClient().incr(key);
    if (count === 1) {
      await this.redis.getClient().pexpire(key, windowMs);
    }

    if (count > maxRequests) {
      return res.status(429).json({
        message: 'Too many requests, please try again later',
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));

    next();
  }
}

