import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('membership')
@UseGuards(JwtAuthGuard)
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get('current')
  async getCurrentMembership(@Request() req) {
    return this.membershipService.getCurrentMembership(req.user.id);
  }

  @Get('limits')
  async getLimits(@Request() req) {
    return this.membershipService.checkMembershipLimits(req.user.id);
  }
}

