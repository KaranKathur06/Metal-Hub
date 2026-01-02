import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
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
}

