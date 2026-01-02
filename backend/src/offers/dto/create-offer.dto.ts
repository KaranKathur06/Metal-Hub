import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  offerPrice: number;
}

