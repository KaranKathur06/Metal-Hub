import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class InquiryQueryDto {
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

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  category?: string;
}
