import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SupplierQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  category?: string;

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

export class UpsertSupplierProfileDto {
  @IsString()
  companyName: string;

  @IsString()
  description: string;

  @IsString()
  location: string;
}

export class CreateSupplierProductDto {
  @IsString()
  productName: string;

  @IsString()
  priceRange: string;

  @IsString()
  moq: string;

  @IsOptional()
  @IsString()
  category?: string;
}
