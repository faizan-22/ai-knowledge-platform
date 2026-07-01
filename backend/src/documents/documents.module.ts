import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DatabaseModule } from 'src/database/database.module';
import { DocumentProcessingModule } from 'src/document-processing/document-processing.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
  imports: [DatabaseModule, DocumentProcessingModule, AuthModule],
})
export class DocumentsModule {}
