import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RateLimitMiddleware } from './rate-limit.middleware';

@Module({})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}

