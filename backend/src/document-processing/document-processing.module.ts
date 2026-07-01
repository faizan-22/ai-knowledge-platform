import { Module } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { DocumentProcessingService } from './document-processing.service';
import { DatabaseModule } from 'src/database/database.module';
import { TextChunkerService } from './text-chunker.service';
import { OpenAiModule } from 'src/open-ai/open-ai.module';
@Module({
  providers: [
    PdfParserService,
    DocumentProcessingService,
    TextChunkerService,
  ],
  exports: [DocumentProcessingService],
  imports: [DatabaseModule, OpenAiModule],
})
export class DocumentProcessingModule {}
