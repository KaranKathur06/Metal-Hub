import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto, SendMessageDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  async createChat(@Body() dto: CreateChatDto, @Request() req) {
    return this.chatService.createChat(req.user.id, dto);
  }

  @Get()
  async getUserChats(@Request() req) {
    return this.chatService.getUserChats(req.user.id);
  }

  @Get(':id')
  async getChat(@Param('id') id: string, @Request() req) {
    return this.chatService.getChat(id, req.user.id);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') chatId: string,
    @Body() dto: SendMessageDto,
    @Request() req,
  ) {
    return this.chatService.sendMessage(chatId, req.user.id, dto);
  }
}

