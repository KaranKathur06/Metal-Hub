import { Injectable } from '@nestjs/common';
import { InquiriesService } from '../inquiries/inquiries.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { MarketplaceQueryDto } from './dto/marketplace-query.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly inquiriesService: InquiriesService,
    private readonly suppliersService: SuppliersService,
  ) {}

  async findAll(query: MarketplaceQueryDto) {
    const activeType = query.type === 'suppliers' ? 'suppliers' : 'buyers';

    if (activeType === 'suppliers') {
      const suppliersData = await this.suppliersService.findAll({
        search: query.search,
        location: query.location,
        category: query.category,
        verified: query.verified,
        moqRange: query.moqRange,
        date: query.date,
        sortBy: query.sort,
        page: query.page,
        limit: query.limit,
      });

      return {
        type: 'suppliers',
        ...suppliersData,
      };
    }

    const inquiriesData = await this.inquiriesService.findAll({
      search: query.search,
      location: query.location,
      category: query.category,
      verified: query.verified,
      date: query.date,
      sortBy: query.sort,
      page: query.page,
      limit: query.limit,
    });

    return {
      type: 'buyers',
      ...inquiriesData,
    };
  }
}
