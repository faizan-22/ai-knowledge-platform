import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { DocumentProcessingModule } from './document-processing/document-processing.module';
import { RetrievalService } from './retrieval/retrieval.service';
import { RetrievalModule } from './retrieval/retrieval.module';
import { ChatModule } from './chat/chat.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    DocumentsModule,
    DocumentProcessingModule,
    RetrievalModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, RetrievalService],
})
export class AppModule {}
