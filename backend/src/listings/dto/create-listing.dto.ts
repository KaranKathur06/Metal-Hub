import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

const METAL_TYPES = ['STEEL', 'IRON', 'ALUMINIUM', 'COPPER', 'BRASS', 'STAINLESS_STEEL', 'OTHER'] as const;
const LISTING_ROLES = ['BUYER', 'SUPPLIER'] as const;
const LISTING_TYPES = ['BUY_LEADS', 'MEMBERS'] as const;
const MEMBERSHIP_PLANS = ['FREE', 'SILVER', 'GOLD'] as const;

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsIn(METAL_TYPES)
  metalType: (typeof METAL_TYPES)[number];

  @IsIn(LISTING_ROLES)
  @IsOptional()
  listingRole?: (typeof LISTING_ROLES)[number];

  @IsIn(LISTING_TYPES)
  @IsOptional()
  listingType?: (typeof LISTING_TYPES)[number];

  @IsIn(MEMBERSHIP_PLANS)
  @IsOptional()
  premiumStatus?: (typeof MEMBERSHIP_PLANS)[number];

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

  @IsIn(METAL_TYPES)
  @IsOptional()
  metalType?: (typeof METAL_TYPES)[number];

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

  @IsIn(METAL_TYPES)
  @IsOptional()
  metalType?: (typeof METAL_TYPES)[number];

  @IsIn(MEMBERSHIP_PLANS)
  @IsOptional()
  premium?: (typeof MEMBERSHIP_PLANS)[number];

  @IsIn(LISTING_TYPES)
  @IsOptional()
  listingType?: (typeof LISTING_TYPES)[number];

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

