/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Request,
  UseInterceptors,
  UploadedFile,
  Logger,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { memoryStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs/promises';
import { mkdir } from 'fs/promises';
import { Prisma } from '@prisma/client';
import { ApiOAuth2 } from '@nestjs/swagger';

@ApiOAuth2([], 'oauth2-login')
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50000000 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('title') title: string,
    @Request() req,
  ) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file.originalname}`;
    const uploadDir = join(__dirname, '..', '..', '..', 'uploads');
    // Ensure the directory exists before writing to it
    await mkdir(uploadDir, { recursive: true });
    const uploadPath = join(uploadDir, filename);

    const userId = parseInt(req.payload.sub);

    await fs.writeFile(uploadPath, file.buffer);
    const fileToStore: Prisma.DocumentCreateInput = {
      title: title,
      originalFileName: file.originalname,
      filePath: uploadPath,
      mimeType: file.mimetype,
      size: file.size,
      user: {
        connect: { id: userId },
      },
    };
    return this.documentsService.create(fileToStore);
  }

  @Get()
  findAll(@Request() req) {
    const userId = parseInt(req.payload.sub);
    return this.documentsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const userId = parseInt(req.payload.sub);
    return this.documentsService.findOne(+id, userId);
  }

  @Patch('/title/:id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) updateDocumentDto: UpdateDocumentDto,
  ) {
    const userId = parseInt(req.payload.sub);
    return this.documentsService.updateTitle(
      +id,
      userId,
      updateDocumentDto.title,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const userId = parseInt(req.payload.sub);
    return this.documentsService.remove(+id, userId);
  }
}
