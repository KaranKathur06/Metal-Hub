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
import { MetalType } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(MetalType)
  metalType: MetalType;

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
  @IsEnum(MetalType)
  @IsOptional()
  metalType?: MetalType;

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

