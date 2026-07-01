import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import {
  RetrievalService,
  type RetrievedChunk,
} from 'src/retrieval/retrieval.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly openAiService: OpenAiService,
  ) {}

  async createAndSendChat(userId: number, documentId: number, query: string) {
    const parsedTopK = Number(process.env.TOP_K);
    const topK =
      Number.isInteger(parsedTopK) && parsedTopK > 0 && parsedTopK <= 20
        ? parsedTopK
        : 3;

    const relevantChunks: RetrievedChunk[] =
      await this.retrievalService.retrieveChunks(
        userId,
        documentId,
        query,
        topK,
      );

    this.logger.log(`Retrieved ${topK} chunks`);

    if (!relevantChunks || relevantChunks.length == 0)
      throw new NotFoundException('Relevant data not found!');

    const context = relevantChunks
      .map((chunk, i) => {
        this.logger.log(
          `[Source ${i + 1} - Page ${chunk.pageNumber} - Distance ${chunk.distance}]`,
        );
        return `[Source ${i + 1} - Page ${chunk.pageNumber}]\n${chunk.content}`;
      })
      .join('\n\n---\n\n');

    return this.openAiService.generateAnswers(context, query);
  }
}
