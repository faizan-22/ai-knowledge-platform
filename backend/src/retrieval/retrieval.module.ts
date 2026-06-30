import { Module } from '@nestjs/common';
import { RetrievalController } from './retrieval.controller';
import { RetrievalService } from './retrieval.service';
import { DocumentProcessingModule } from 'src/document-processing/document-processing.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [RetrievalController],
  providers: [RetrievalService],
  imports: [DatabaseModule, DocumentProcessingModule],
  exports: [RetrievalService],
})
export class RetrievalModule {}
