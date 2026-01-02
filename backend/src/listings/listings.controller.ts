import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto, UpdateListingDto, ListingQueryDto } from './dto/create-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateListingDto, @Request() req) {
    return this.listingsService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Query() query: ListingQueryDto) {
    return this.listingsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyListings(@Request() req) {
    return this.listingsService.getMyListings(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @Request() req,
  ) {
    return this.listingsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req) {
    return this.listingsService.delete(req.user.id, id);
  }
}

