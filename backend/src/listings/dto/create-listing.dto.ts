import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ListingRole, ListingType, MembershipPlan, MetalType } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(MetalType)
  metalType: MetalType;

  @IsEnum(ListingRole)
  @IsOptional()
  listingRole?: ListingRole;

  @IsEnum(ListingType)
  @IsOptional()
  listingType?: ListingType;

  @IsEnum(MembershipPlan)
  @IsOptional()
  premiumStatus?: MembershipPlan;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industries?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  capabilities?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  metals?: string[];

  @IsString()
  @IsOptional()
  grade?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  @IsOptional()
  isNegotiable?: boolean;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNotEmpty()
  location: {
    city: string;
    state: string;
    country: string;
  };

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];
}

export class UpdateListingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MetalType)
  @IsOptional()
  metalType?: MetalType;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isNegotiable?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsOptional()
  location?: {
    city: string;
    state: string;
    country: string;
  };
}

export class ListingQueryDto {
  @IsString()
  @IsOptional()
  type?: 'buyers' | 'suppliers';

  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').filter(Boolean) : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  country?: string[];

  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').filter(Boolean) : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industry?: string[];

  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').filter(Boolean) : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  capability?: string[];

  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').filter(Boolean) : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  metal?: string[];

  @IsEnum(MetalType)
  @IsOptional()
  metalType?: MetalType;

  @IsEnum(MembershipPlan)
  @IsOptional()
  premium?: MembershipPlan;

  @IsEnum(ListingType)
  @IsOptional()
  listingType?: ListingType;

  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber()
  @IsOptional()
  dateRange?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  sortBy?: 'newest' | 'price-low' | 'price-high';

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}

