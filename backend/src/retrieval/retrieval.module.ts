import { Module } from '@nestjs/common';
import { RetrievalController } from './retrieval.controller';
import { RetrievalService } from './retrieval.service';
import { DatabaseModule } from 'src/database/database.module';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [RetrievalController],
  providers: [RetrievalService],
  imports: [DatabaseModule, OpenAiModule, AuthModule],
  exports: [RetrievalService],
})
export class RetrievalModule {}
