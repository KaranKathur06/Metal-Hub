import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { MembershipPlan } from '@prisma/client';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, plan: MembershipPlan) {
    const planPrices = {
      FREE: 0,
      SILVER: 99900, // ₹999 in paise
      GOLD: 249900, // ₹2499 in paise
    };

    const amount = planPrices[plan];
    if (amount === 0) {
      throw new BadRequestException('Free plan does not require payment');
    }

    // Calculate end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `membership_${userId}_${Date.now()}`,
      notes: {
        userId,
        plan,
      },
    };

    const order = await this.razorpay.orders.create(options);

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        razorpayOrderId: order.id,
        amount: amount / 100, // Convert paise to rupees
        currency: 'INR',
        status: 'CREATED',
        plan,
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
    };
  }

  async verifyWebhook(signature: string, payload: string): Promise<boolean> {
    const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  async handleWebhook(event: any) {
    // Log webhook event
    await this.prisma.razorpayEvent.create({
      data: {
        eventType: event.event,
        payload: event,
      },
    });

    if (event.event === 'payment.captured') {
      const paymentId = event.payload.payment.entity.id;
      const orderId = event.payload.payment.entity.order_id;

      // Find payment record
      const payment = await this.prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: paymentId,
          status: 'SUCCESS',
        },
      });

      // Upgrade membership
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await this.prisma.membership.updateMany({
        where: {
          userId: payment.userId,
          status: 'ACTIVE',
        },
        data: { status: 'CANCELLED' },
      });

      await this.prisma.membership.create({
        data: {
          userId: payment.userId,
          plan: payment.plan as MembershipPlan,
          endDate,
          status: 'ACTIVE',
        },
      });

      return { message: 'Payment processed successfully' };
    }

    if (event.event === 'payment.failed') {
      const orderId = event.payload.payment.entity.order_id;
      const payment = await this.prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
      }
    }

    return { message: 'Webhook processed' };
  }
}

