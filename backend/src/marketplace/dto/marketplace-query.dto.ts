import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

function toStringArray(value: unknown): string[] | undefined {
  if (typeof value === 'undefined' || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export class MarketplaceQueryDto {
  @IsOptional()
  @IsIn(['buyers', 'suppliers'])
  type?: 'buyers' | 'suppliers';

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
  @IsIn(['latest', 'verified', 'price', 'rating'])
  sort?: 'latest' | 'verified' | 'price' | 'rating';

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
