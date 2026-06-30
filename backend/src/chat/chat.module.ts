import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RetrievalModule } from 'src/retrieval/retrieval.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [RetrievalModule, DatabaseModule],
})
export class ChatModule {}
