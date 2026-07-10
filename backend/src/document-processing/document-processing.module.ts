import { Module } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { DocumentProcessingService } from './document-processing.service';
import { DatabaseModule } from 'src/database/database.module';
import { TextChunkerService } from './text-chunker.service';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
import { DocumentProcessingWorker } from './document.worker';
@Module({
  providers: [
    PdfParserService,
    DocumentProcessingService,
    TextChunkerService,
    DocumentProcessingWorker,
  ],
  exports: [DocumentProcessingService],
  imports: [DatabaseModule, OpenAiModule],
})
export class DocumentProcessingModule {}
