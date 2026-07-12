import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FileStatus, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
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
  constructor(
    private readonly databaseService: DatabaseService,
    @InjectQueue('document-processing') private documentQueue: Queue,
  ) {}

  async create(createDocumentDto: Prisma.DocumentCreateInput) {
    const retVal = await this.databaseService.document.create({
      data: createDocumentDto,
      select: documentSelect,
    });

    const client = await this.documentQueue.client;
    const isRedisConnected = client.status === 'ready';

    if (!isRedisConnected) {
      this.logger.error('Queue system is currently unavaible');
      throw new ServiceUnavailableException(
        'Our background processing system is temporarily down. Please retry processing in a few minutes.',
      );
    }

    await this.documentQueue.add(
      'process',
      {
        id: retVal.id,
        filePath: retVal.filePath,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnFail: { count: 100 },
      },
    );

    const freshVal = await this.databaseService.document.update({
      where: {
        id: retVal.id,
      },
      data: {
        status: 'QUEUED',
      },
      select: documentSelect,
    });

    this.logger.log('Queued successfully');

    return freshVal;
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

  async retryProcessing(id: number, userId: number) {
    const documentInfo = await this.databaseService.document.findUnique({
      where: {
        id: id,
      },
      select: { userId: true, status: true, filePath: true },
    });

    if (!documentInfo) throw new NotFoundException('Document Not Found!');

    if (documentInfo.userId != userId) {
      throw new NotFoundException('Document Not Found!');
    }

    if (documentInfo.status != FileStatus.FAILED) {
      throw new NotFoundException('Document is not in Failed State!');
    }

    await this.documentQueue.add(
      'process',
      {
        id,
        filePath: documentInfo.filePath,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnFail: { count: 100 },
      },
    );

    const freshVal = await this.databaseService.document.update({
      where: {
        id,
      },
      data: {
        status: 'QUEUED',
        processingError: null,
      },
      select: documentSelect,
    });

    this.logger.log('Queued successfully');

    return freshVal;
  }
}
