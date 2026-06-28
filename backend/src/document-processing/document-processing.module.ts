import { Module } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { DocumentProcessingService } from './document-processing.service';
import { DatabaseModule } from 'src/database/database.module';
import { TextChunkerService } from './text-chunker.service';
import { EmbeddingsService } from './embeddings.service';

@Module({
  providers: [
    PdfParserService,
    DocumentProcessingService,
    TextChunkerService,
    EmbeddingsService,
  ],
  exports: [DocumentProcessingService],
  imports: [DatabaseModule],
})
export class DocumentProcessingModule {}
