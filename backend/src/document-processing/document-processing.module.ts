import { Module } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { DocumentProcessingService } from './document-processing.service';
import { DatabaseModule } from 'src/database/database.module';
import { TextChunkerService } from './text-chunker.service';

@Module({
  providers: [PdfParserService, DocumentProcessingService, TextChunkerService],
  exports: [DocumentProcessingService],
  imports: [DatabaseModule],
})
export class DocumentProcessingModule {}
