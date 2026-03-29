import { Controller, Get, Query } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const activeOnly = includeInactive !== 'true';
    return this.bannersService.findAll(activeOnly);
  }
}
