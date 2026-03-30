import {
  IsInt,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

function toStringArray(value: unknown): string[] | undefined {
  if (typeof value === 'undefined' || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export class InquiryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  location?: string[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  category?: string[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  capability?: string[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  industry?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === true || value === 'true' || value === 1 || value === '1'
      ? true
      : value === false || value === 'false' || value === 0 || value === '0'
        ? false
        : undefined,
  )
  verified?: boolean;

  @IsOptional()
  @IsIn(['last-24h', 'last-7d', 'last-30d'])
  date?: 'last-24h' | 'last-7d' | 'last-30d';

  @IsOptional()
  @IsIn(['latest', 'verified', 'price'])
  sortBy?: 'latest' | 'verified' | 'price';

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CreateInquiryDto {
  @IsString()
  productName: string;

  @IsString()
  description: string;

  @IsString()
  quantity: string;

  @Transform(({ value }) => (value === null || value === '' ? undefined : Number(value)))
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsString()
  location: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsIn(['HIGH', 'MEDIUM', 'LOW'])
  urgency?: 'HIGH' | 'MEDIUM' | 'LOW';
}
