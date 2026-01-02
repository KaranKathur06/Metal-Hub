import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  WhatsAppOTPDto,
  VerifyOTPDto,
} from './dto/login.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
    return this.authService.register(dto, ipAddress, deviceFingerprint);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
    return this.authService.login(dto, ipAddress, deviceFingerprint);
  }

  @Post('whatsapp-otp')
  @HttpCode(HttpStatus.OK)
  async sendWhatsAppOTP(@Body() dto: WhatsAppOTPDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    return this.authService.sendWhatsAppOTP(dto, ipAddress);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOTP(@Body() dto: VerifyOTPDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
    return this.authService.verifyOTP(dto, ipAddress, deviceFingerprint);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() dto: { idToken: string }, @Req() req: Request) {
    // TODO: Implement Google OAuth verification
    throw new Error('Google OAuth not implemented yet');
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async appleAuth(
    @Body() dto: { identityToken: string; authorizationCode: string },
    @Req() req: Request,
  ) {
    // TODO: Implement Apple OAuth verification
    throw new Error('Apple OAuth not implemented yet');
  }
}

