import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { EmbeddingsService } from './embeddings.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TextChunkerService {
  private sanitizeText(text: string): string {
    // Remove null bytes
    return text.replace(/\0/g, ' ').trim();
  }

  private readonly logger = new Logger(TextChunkerService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async chunkText(
    pageContent: { page: number; text: string },
    documentId: number,
    chunkStartIndex: number,
  ) {
    try {
      const CHUNK_SIZE = 900;
      const CHUNK_OVERLAP = 200;
      const CHUNK_STEP = CHUNK_SIZE - CHUNK_OVERLAP;
      const sanitizedText = this.sanitizeText(pageContent.text);
      const prisma = new PrismaClient();

      let ptr = 0;
      let chunkIndex = chunkStartIndex;

      while (ptr < sanitizedText.length) {
        const chunk = sanitizedText.substring(ptr, ptr + CHUNK_SIZE);

        const { id } = await this.databaseService.documentChunk.create({
          data: {
            chunkIndex,
            content: chunk,
            pageNumber: pageContent.page,
            document: { connect: { id: documentId } },
          },
        });

        const embeddingVector =
          await this.embeddingsService.generateEmbeddings(chunk);
        const vectorString = `[${embeddingVector.join(',')}]`;

        await prisma.$executeRaw`
          UPDATE "DocumentChunk"
          SET "embedding" = ${vectorString}::vector
          WHERE "id" = ${id};
        `;

        chunkIndex += 1;
        ptr += CHUNK_STEP;

        if (
          ptr < sanitizedText.length &&
          sanitizedText.length - ptr <= CHUNK_OVERLAP
        ) {
          break;
        }
      }

      return chunkIndex;
    } catch (err) {
      this.logger.error(err);
    }
  }
}
