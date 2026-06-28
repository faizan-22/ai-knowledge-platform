import { Injectable, Logger } from '@nestjs/common';
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

const chunkSelect = {
  id: true,
  documentId: true,
  chunkIndex: true,
  pageNumber: true,
  content: true,
};

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDocumentDto: Prisma.DocumentCreateInput) {
    try {
      return await this.databaseService.document.create({
        data: createDocumentDto,
        select: documentSelect,
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async findAll(userId: number) {
    try {
      return await this.databaseService.document.findMany({
        where: {
          userId: userId,
        },
        select: documentSelect,
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async findOne(id: number, userId: number) {
    try {
      return await this.databaseService.document.findUnique({
        where: {
          id: id,
          userId: userId,
        },
        select: documentSelect,
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async findChunks(id: number, userId: number) {
    try {
      const prisma = new PrismaClient();
      const document = await this.databaseService.document.findUnique({
        where: {
          id: id,
        },
        select: { userId: true },
      });

      if (!document) throw new Error('Task Not Found');

      if (document.userId != userId) {
        throw new Error('You cannot access this task');
      }

      const chunks = await prisma.$queryRaw<any[]>`
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
    } catch (err) {
      this.logger.error(err);
    }
  }

  async updateTitle(id: number, userId: number, newTitle: string) {
    try {
      const document = await this.databaseService.document.findUnique({
        where: {
          id: id,
        },
        select: { userId: true },
      });

      if (!document) throw new Error('Task Not Found');

      if (document.userId != userId) {
        throw new Error('You cannot access this task');
      }

      const updatedDocument = await this.databaseService.document.update({
        where: {
          id: id,
        },
        data: { ...document, title: newTitle },
        select: documentSelect,
      });

      return updatedDocument;
    } catch (err) {
      this.logger.error(err);
    }
  }

  async updateStatus(
    id: number,
    userId: number,
    newStatus: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED',
  ) {
    try {
      const document = await this.databaseService.document.findUnique({
        where: {
          id: id,
        },
        select: { userId: true },
      });

      if (!document) throw new Error('Task Not Found');

      if (document.userId != userId) {
        throw new Error('You cannot access this task');
      }

      const updatedDocument = await this.databaseService.document.update({
        where: {
          id: id,
        },
        data: { ...document, status: newStatus },
        select: documentSelect,
      });

      return updatedDocument;
    } catch (err) {
      this.logger.error(err);
    }
  }

  async remove(id: number, userId: number) {
    try {
      const document = await this.databaseService.document.findUnique({
        where: {
          id: id,
        },
        select: { userId: true },
      });

      if (!document) throw new Error('Task Not Found');

      if (document.userId != userId) {
        throw new Error('You cannot access this task');
      }

      const deletedDocument = this.databaseService.document.delete({
        where: {
          id: id,
        },
        select: documentSelect,
      });

      return deletedDocument;
    } catch (err) {
      this.logger.error(err);
    }
  }
}
