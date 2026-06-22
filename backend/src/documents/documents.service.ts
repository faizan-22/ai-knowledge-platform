import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDocumentDto: Prisma.DocumentCreateInput) {
    try {
      return await this.databaseService.document.create({
        data: createDocumentDto,
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
        select: {
          title: true,
          originalFileName: true,
          filePath: true,
          mimeType: true,
          size: true,
          status: true,
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async findOne(id: number, userId: number) {
    try {
      return await this.databaseService.document.findMany({
        where: {
          id: id,
          userId: userId,
        },
        select: {
          title: true,
          originalFileName: true,
          filePath: true,
          size: true,
          status: true,
        },
      });
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
        select: {
          title: true,
          originalFileName: true,
          filePath: true,
          size: true,
          status: true,
        },
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
        select: {
          title: true,
          originalFileName: true,
          filePath: true,
          size: true,
          status: true,
        },
      });

      return deletedDocument;
    } catch (err) {
      this.logger.error(err);
    }
  }
}
