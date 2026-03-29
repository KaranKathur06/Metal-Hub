import { Controller, Get, Param, Query } from '@nestjs/common';
import { CapabilitiesService } from './capabilities.service';

@Controller('capabilities')
export class CapabilitiesController {
  constructor(private readonly capabilitiesService: CapabilitiesService) {}

  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const activeOnly = includeInactive !== 'true';
    return this.capabilitiesService.findAll(activeOnly);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.capabilitiesService.findBySlug(slug);
  }
}
