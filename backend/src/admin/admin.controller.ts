import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getAllUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllUsers(page || 1, limit || 20);
  }

  @Post('users/:id/ban')
  async banUser(@Param('id') userId: string, @Request() req) {
    return this.adminService.banUser(req.user.id, userId);
  }

  @Post('users/:id/suspend')
  async suspendUser(@Param('id') userId: string, @Request() req) {
    return this.adminService.suspendUser(req.user.id, userId);
  }

  @Get('listings/pending')
  async getPendingListings(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getPendingListings(page || 1, limit || 20);
  }

  @Post('listings/:id/approve')
  async approveListing(@Param('id') listingId: string, @Request() req) {
    return this.adminService.approveListing(req.user.id, listingId);
  }

  @Post('listings/:id/reject')
  async rejectListing(
    @Param('id') listingId: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    return this.adminService.rejectListing(req.user.id, listingId, body.reason);
  }

  @Post('listings/:id/feature')
  async featureListing(
    @Param('id') listingId: string,
    @Body() body: { days?: number },
    @Request() req,
  ) {
    return this.adminService.featureListing(req.user.id, listingId, body.days || 7);
  }

  @Get('banners')
  async getBanners() {
    return this.adminService.getBanners();
  }

  @Post('banners')
  async createBanner(@Body() body: any, @Request() req) {
    return this.adminService.createBanner(req.user.id, body);
  }

  @Put('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.adminService.updateBanner(req.user.id, id, body);
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteBanner(req.user.id, id);
  }

  @Post('banners/reorder')
  async reorderBanners(@Body() body: { ids: string[] }, @Request() req) {
    return this.adminService.reorderBanners(req.user.id, body.ids || []);
  }

  @Get('capabilities')
  async getCapabilities() {
    return this.adminService.getCapabilities();
  }

  @Post('capabilities')
  async createCapability(@Body() body: any, @Request() req) {
    return this.adminService.createCapability(req.user.id, body);
  }

  @Put('capabilities/:id')
  async updateCapability(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.adminService.updateCapability(req.user.id, id, body);
  }

  @Delete('capabilities/:id')
  async deleteCapability(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteCapability(req.user.id, id);
  }

  @Post('capabilities/reorder')
  async reorderCapabilities(@Body() body: { ids: string[] }, @Request() req) {
    return this.adminService.reorderCapabilities(req.user.id, body.ids || []);
  }

  @Get('suppliers/pending')
  async getPendingSuppliers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getPendingSuppliers(page || 1, limit || 20);
  }

  @Post('suppliers/:id/approve')
  async approveSupplier(@Param('id') supplierId: string, @Request() req) {
    return this.adminService.approveSupplier(req.user.id, supplierId);
  }
}
