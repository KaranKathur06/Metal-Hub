import { IsEmail, IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsIn(['BUYER', 'SELLER'])
  role: 'BUYER' | 'SELLER';

  @IsString()
  @IsOptional()
  fullName?: string;
}

export class WhatsAppOTPDto {
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  deviceFingerprint?: string;
}

export class VerifyOTPDto {
  @IsString()
  phone: string;

  @IsString()
  otp: string;
}

export class GoogleAuthDto {
  @IsString()
  idToken: string;
}

export class AppleAuthDto {
  @IsString()
  identityToken: string;

  @IsString()
  authorizationCode: string;
}

