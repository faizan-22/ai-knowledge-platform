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
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(
    @Request() req,
    @Body(new ValidationPipe({ transform: true }))
    createDocumentDto: CreateDocumentDto,
  ) {
    const userId = parseInt(req.payload.sub);
    const orgFileName =
      createDocumentDto.filePath.split('/').pop() ?? 'UnknownFileName';

    const documentData = {
      ...createDocumentDto,
      user: {
        connect: { id: userId },
      },
      originalFileName: orgFileName,
    };
    return this.documentsService.create(documentData);
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

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body(ValidationPipe) updateDocumentDto: UpdateDocumentDto,
  ) {
    const userId = parseInt(req.payload.sub);
    return this.documentsService.update(+id, userId, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const userId = parseInt(req.payload.sub);
    return this.documentsService.remove(+id, userId);
  }
}
