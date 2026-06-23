import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { DocumentModule } from './documents/documents.module';
import { PdfParserModule } from './pdf-parser/pdf-parser.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    DocumentModule,
    PdfParserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
