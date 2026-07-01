import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RetrievalModule } from 'src/retrieval/retrieval.module';
import { DatabaseModule } from 'src/database/database.module';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [RetrievalModule, DatabaseModule, OpenAiModule, AuthModule],
})
export class ChatModule {}
