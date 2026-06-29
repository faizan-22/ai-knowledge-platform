import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';

@Injectable()
export class TextChunkerService {
  private sanitizeText(text: string): string {
    // Remove null bytes
    return text.replace(/\0/g, ' ').trim();
  }

  private readonly logger = new Logger(TextChunkerService.name);

  async chunkText(pageContent: { page: number; text: string }) {
    try {
      const CHUNK_SIZE = 900;
      const CHUNK_OVERLAP = 200;
      const CHUNK_STEP = CHUNK_SIZE - CHUNK_OVERLAP;
      const sanitizedText = this.sanitizeText(pageContent.text);

      const chunks: { content: string; pageNumber: number }[] = [];
      let ptr = 0;

      while (ptr < sanitizedText.length) {
        const chunk = sanitizedText.substring(ptr, ptr + CHUNK_SIZE);

        chunks.push({
          content: chunk,
          pageNumber: pageContent.page,
        });

        ptr += CHUNK_STEP;

        if (
          ptr < sanitizedText.length &&
          sanitizedText.length - ptr <= CHUNK_OVERLAP
        ) {
          break;
        }
      }

      return chunks;
    } catch (err) {
      this.logger.error(err);
    }
  }
}
