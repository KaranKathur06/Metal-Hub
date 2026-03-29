import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, InquiryQueryDto } from './dto/inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  async findAll(@Query() query: InquiryQueryDto) {
    return this.inquiriesService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(req.user, dto);
  }
}
