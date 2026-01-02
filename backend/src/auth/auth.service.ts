import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, WhatsAppOTPDto, VerifyOTPDto } from './dto/login.dto';
import { UserRole, UserStatus } from '@prisma/client';
import { Twilio } from 'twilio';

@Injectable()
export class AuthService {
  private twilioClient: Twilio;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {
    // Initialize Twilio if credentials are provided
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    }
  }

  async register(dto: RegisterDto, ipAddress: string, deviceFingerprint?: string) {
    // Check if email or phone already exists
    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already registered');
      }
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone already registered');
      }
    }

    // Hash password if provided
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, parseInt(process.env.BCRYPT_ROUNDS || '10'))
      : null;

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        role: dto.role,
        emailVerified: !dto.email, // If no email, mark as verified
        phoneVerified: !dto.phone, // If no phone, mark as verified
      },
    });

    // Create profile
    await this.prisma.profile.create({
      data: {
        userId: user.id,
        fullName: dto.fullName,
      },
    });

    // Create free membership (7-day trial)
    if (deviceFingerprint && !(await this.redis.hasTrialBeenUsed(deviceFingerprint))) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      await this.prisma.membership.create({
        data: {
          userId: user.id,
          plan: 'FREE',
          endDate: trialEndDate,
        },
      });

      await this.redis.setTrialUsed(deviceFingerprint);
    } else {
      await this.prisma.membership.create({
        data: {
          userId: user.id,
          plan: 'FREE',
        },
      });
    }

    // Log login activity
    await this.prisma.loginActivity.create({
      data: {
        userId: user.id,
        ipAddress,
        deviceFingerprint,
        success: true,
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto, ipAddress: string, deviceFingerprint?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is suspended or banned');
    }

    // Check login attempts
    const attempts = await this.redis.getLoginAttempts(ipAddress);
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');

    if (attempts >= maxAttempts) {
      throw new UnauthorizedException('Too many login attempts. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.redis.incrementLoginAttempts(ipAddress);
      await this.prisma.loginActivity.create({
        data: {
          userId: user.id,
          ipAddress,
          deviceFingerprint,
          success: false,
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on success
    await this.redis.resetLoginAttempts(ipAddress);

    // Log successful login
    await this.prisma.loginActivity.create({
      data: {
        userId: user.id,
        ipAddress,
        deviceFingerprint,
        success: true,
      },
    });

    return this.generateTokens(user);
  }

  async sendWhatsAppOTP(dto: WhatsAppOTPDto, ipAddress: string) {
    // Check if phone exists
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new BadRequestException('Phone number not registered');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis (10 minutes expiry)
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    await this.redis.setOTP(dto.phone, otp, expiryMinutes);

    // Send OTP via WhatsApp (Twilio)
    if (this.twilioClient) {
      try {
        await this.twilioClient.messages.create({
          body: `Your MetalHub verification code is: ${otp}. Valid for ${expiryMinutes} minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: dto.phone,
        });
      } catch (error) {
        console.error('Twilio error:', error);
        // In development, log OTP instead
        if (process.env.NODE_ENV === 'development') {
          console.log(`OTP for ${dto.phone}: ${otp}`);
        }
      }
    } else {
      // Development mode - log OTP
      console.log(`OTP for ${dto.phone}: ${otp}`);
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOTP(dto: VerifyOTPDto, ipAddress: string, deviceFingerprint?: string) {
    // Get stored OTP
    const storedOTP = await this.redis.getOTP(dto.phone);
    if (!storedOTP || storedOTP !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is suspended or banned');
    }

    // Verify phone
    await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    });

    // Delete OTP
    await this.redis.deleteOTP(dto.phone);

    // Log login activity
    await this.prisma.loginActivity.create({
      data: {
        userId: user.id,
        ipAddress,
        deviceFingerprint,
        success: true,
      },
    });

    return this.generateTokens(user);
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, memberships: { where: { status: 'ACTIVE' } } },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    };
  }
}

