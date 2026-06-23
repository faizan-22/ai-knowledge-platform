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
import { ApiBody, ApiConsumes, ApiOAuth2, ApiOperation } from '@nestjs/swagger';
import { PdfParserService } from 'src/pdf-parser/pdf-parser.service';

@ApiOAuth2([], 'oauth2-login')
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly pdfParserService: PdfParserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload a local file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          // This key must match the string inside FileInterceptor
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
          description: 'title of the document',
        },
      },
    },
  })
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
    @Body(ValidationPipe) createDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${file.originalname}`;
    const uploadDir = join(process.cwd(), 'uploads');
    // Ensure the directory exists before writing to it
    await mkdir(uploadDir, { recursive: true });
    const uploadPath = join(uploadDir, filename);

    const userId = parseInt(req.payload.sub);

    await fs.writeFile(uploadPath, file.buffer);

    const data = await this.pdfParserService.parsePdf(filename);

    this.logger.log(data?.info);
    this.logger.log(data?.text);

    const fileToStore: Prisma.DocumentCreateInput = {
      title: createDocumentDto.title,
      originalFileName: file.originalname,
      filePath: filename,
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
