import { Module } from '@nestjs/common';
import { RetrievalController } from './retrieval.controller';
import { RetrievalService } from './retrieval.service';
import { DatabaseModule } from 'src/database/database.module';
import { OpenAiModule } from 'src/open-ai/open-ai.module';

@Module({
  controllers: [RetrievalController],
  providers: [RetrievalService],
  imports: [DatabaseModule, OpenAiModule],
  exports: [RetrievalService],
})
export class RetrievalModule {}
