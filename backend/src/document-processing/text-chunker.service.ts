import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TextChunkerService {
  private sanitizeText(text: string): string {
    // Remove null bytes
    return text.replace(/\0/g, ' ').trim();
  }

  private readonly logger = new Logger(TextChunkerService.name);
  constructor(private readonly databaseService: DatabaseService) {}

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

      let ptr = 0;
      let chunkIndex = chunkStartIndex;

      while (ptr < sanitizedText.length) {
        const chunk = sanitizedText.substring(ptr, ptr + CHUNK_SIZE);

        await this.databaseService.documentChunk.create({
          data: {
            chunkIndex,
            content: chunk,
            pageNumber: pageContent.page,
            document: { connect: { id: documentId } },
          },
        });

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
