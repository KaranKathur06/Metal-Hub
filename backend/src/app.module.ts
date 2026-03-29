import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { ChatModule } from './chat/chat.module';
import { OffersModule } from './offers/offers.module';
import { MembershipModule } from './membership/membership.module';
import { PaymentModule } from './payment/payment.module';
import { AdminModule } from './admin/admin.module';
import { RedisModule } from './redis/redis.module';
import { SecurityModule } from './security/security.module';
import { BannersModule } from './banners/banners.module';
import { CapabilitiesModule } from './capabilities/capabilities.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { MarketplaceModule } from './marketplace/marketplace.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    SecurityModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    ChatModule,
    OffersModule,
    MembershipModule,
    PaymentModule,
    BannersModule,
    CapabilitiesModule,
    InquiriesModule,
    SuppliersModule,
    MarketplaceModule,
    AdminModule,
  ],
})
export class AppModule {}
