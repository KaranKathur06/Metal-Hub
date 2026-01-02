import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  listingId: string;

  @IsString()
  @IsOptional()
  initialMessage?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

