import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PdfParserModule } from 'src/pdf-parser/pdf-parser.module';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
  imports: [DatabaseModule, PdfParserModule],
})
export class DocumentModule {}
