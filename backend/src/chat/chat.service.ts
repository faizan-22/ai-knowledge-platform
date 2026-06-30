import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  RetrievalService,
  type RetrievedChunk,
} from 'src/retrieval/retrieval.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(private readonly retrievalService: RetrievalService) {}

  async createAndSendChat(userId: number, documentId: number, query: string) {
    try {
      const relevantChunks: RetrievedChunk[] =
        await this.retrievalService.retrieveChunks(
          userId,
          documentId,
          query,
          3,
        );

      if (!relevantChunks || relevantChunks.length == 0)
        throw new NotFoundException('Relevant data not found!');

      const context = relevantChunks
        .map(
          (chunk, i) =>
            `[Source ${i + 1} - Page ${chunk.pageNumber}]\n${chunk.content}`,
        )
        .join('\n\n---\n\n');

      const prompt = `
      You are an assistant answering questions using only the provided document context.

      Rules:
      - Use only the context below.
      - If the context does not contain the answer, say: "I couldn't find that information in the document."
      - Do not make assumptions or use outside knowledge.
      - Keep the answer concise.

      Context:
      ${context}

      Question:
      ${query}

      Answer:
      `;

      return prompt;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
