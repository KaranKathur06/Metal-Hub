import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuppliersService } from './suppliers.service';
import {
  CreateSupplierProductDto,
  SupplierQueryDto,
  UpsertSupplierProfileDto,
} from './dto/supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll(@Query() query: SupplierQueryDto) {
    return this.suppliersService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMine(@Request() req) {
    return this.suppliersService.getMyProfile(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async upsertProfile(@Request() req, @Body() dto: UpsertSupplierProfileDto) {
    return this.suppliersService.upsertProfile(req.user, dto);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  async addProduct(@Request() req, @Body() dto: CreateSupplierProductDto) {
    return this.suppliersService.addProduct(req.user, dto);
  }
}
