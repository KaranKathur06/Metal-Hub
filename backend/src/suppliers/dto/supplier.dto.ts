import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsIn,
  IsBoolean,
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

export class SupplierQueryDto {
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
  @IsIn(['lt-100', '100-1000', 'gt-1000'])
  moqRange?: 'lt-100' | '100-1000' | 'gt-1000';

  @IsOptional()
  @IsIn(['last-24h', 'last-7d', 'last-30d'])
  date?: 'last-24h' | 'last-7d' | 'last-30d';

  @IsOptional()
  @IsIn(['latest', 'verified', 'price', 'rating', 'response', 'completion'])
  sortBy?: 'latest' | 'verified' | 'price' | 'rating' | 'response' | 'completion';

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

export class UpsertSupplierProfileDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsBoolean()
  isoCertified?: boolean;

  @IsOptional()
  @IsBoolean()
  exportReady?: boolean;
}

export class CreateSupplierProductDto {
  @IsString()
  productName: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsString()
  priceRange: string;

  @IsString()
  moq: string;

  @IsString()
  productionCapacity: string;

  @IsOptional()
  @IsString()
  capabilitySlug?: string;
}
