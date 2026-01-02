import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private adminService: AdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const isAdmin = await this.adminService.isAdmin(user.id);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

