import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

const documentSelect = {
  id: true,
  title: true,
  originalFileName: true,
  filePath: true,
  mimeType: true,
  size: true,
  status: true,
};

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDocumentDto: Prisma.DocumentCreateInput) {
    return await this.databaseService.document.create({
      data: createDocumentDto,
      select: documentSelect,
    });
  }

  async findAll(userId: number) {
    return await this.databaseService.document.findMany({
      where: {
        userId: userId,
      },
      select: documentSelect,
    });
  }

  async findOne(id: number, userId: number) {
    const document = await this.databaseService.document.findUnique({
      where: {
        id: id,
        userId: userId,
      },
      select: documentSelect,
    });

    if (!document) throw new NotFoundException('Document Not Found!');

    return document;
  }

  async findChunks(id: number, userId: number) {
    const document = await this.databaseService.document.findUnique({
      where: {
        id: id,
      },
      select: { userId: true },
    });

    if (!document) throw new NotFoundException('Document Not Found!');

    if (document.userId != userId) {
      throw new NotFoundException('Document Not Found!');
    }

    const chunks = await this.databaseService.$queryRaw<any[]>`
      SELECT
        id,
        content,
        "pageNumber",
        "documentId",
        "createdAt",
        "embedding"::text AS "embeddingString"
        FROM "DocumentChunk"
        WHERE "documentId" = ${id};
      `;

    return chunks.map(({ embeddingString, ...chunk }) => ({
      ...chunk,
      embedding: embeddingString
        ? embeddingString
            .replace(/[\[\]]/g, '')
            .split(',')
            .map(Number)
        : null,
    }));
  }

  async updateTitle(id: number, userId: number, newTitle: string) {
    const document = await this.databaseService.document.findUnique({
      where: {
        id: id,
      },
      select: { userId: true },
    });

    if (!document) throw new NotFoundException('Document Not Found!');

    if (document.userId != userId) {
      throw new NotFoundException('Document Not Found!');
    }

    const updatedDocument = await this.databaseService.document.update({
      where: {
        id: id,
      },
      data: { ...document, title: newTitle },
      select: documentSelect,
    });

    return updatedDocument;
  }

  async remove(id: number, userId: number) {
    const document = await this.databaseService.document.findUnique({
      where: {
        id: id,
      },
      select: { userId: true },
    });

    if (!document) throw new NotFoundException('Document Not Found!');

    if (document.userId != userId) {
      throw new NotFoundException('Document Not Found!');
    }

    const deletedDocument = this.databaseService.document.delete({
      where: {
        id: id,
      },
      select: documentSelect,
    });

    return deletedDocument;
  }
}
