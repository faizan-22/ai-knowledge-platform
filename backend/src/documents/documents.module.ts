import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
  imports: [DatabaseModule],
})
export class DocumentModule {}
