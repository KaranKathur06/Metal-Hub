import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MembershipPlan } from '@prisma/client';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() body: { plan: MembershipPlan }, @Request() req) {
    return this.paymentService.createOrder(req.user.id, body.plan);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
  ) {
    const payload = JSON.stringify(req.body);
    const isValid = await this.paymentService.verifyWebhook(signature, payload);

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    return this.paymentService.handleWebhook(req.body);
  }
}

