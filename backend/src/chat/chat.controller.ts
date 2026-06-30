import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ApiOAuth2 } from '@nestjs/swagger';

@ApiOAuth2([], 'oauth2-login')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':id')
  chat(
    @Request() req,
    @Body(ValidationPipe) chatDto: ChatDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = parseInt(req.payload.sub);
    return this.chatService.createAndSendChat(userId, id, chatDto.query);
  }
}
