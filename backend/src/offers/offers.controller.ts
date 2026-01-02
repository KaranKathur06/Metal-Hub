import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post('listing/:listingId')
  async createOffer(
    @Param('listingId') listingId: string,
    @Body() dto: CreateOfferDto,
    @Request() req,
  ) {
    return this.offersService.createOffer(req.user.id, listingId, dto);
  }

  @Get('listing/:listingId')
  async getListingOffers(@Param('listingId') listingId: string, @Request() req) {
    return this.offersService.getListingOffers(listingId, req.user.id);
  }

  @Get('my')
  async getMyOffers(@Request() req) {
    return this.offersService.getMyOffers(req.user.id);
  }

  @Post(':id/accept')
  async acceptOffer(@Param('id') id: string, @Request() req) {
    return this.offersService.acceptOffer(id, req.user.id);
  }

  @Post(':id/reject')
  async rejectOffer(@Param('id') id: string, @Request() req) {
    return this.offersService.rejectOffer(id, req.user.id);
  }
}

