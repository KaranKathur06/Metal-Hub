import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { InquiriesModule } from '../inquiries/inquiries.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [InquiriesModule, SuppliersModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
