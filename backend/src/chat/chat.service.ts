import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OpenAiService } from 'src/open-ai/open-ai.service';
import {
  RetrievalService,
  type RetrievedChunk,
} from 'src/retrieval/retrieval.service';

interface ParsedResponse {
  answer: string;
  sources: {
    id: number;
    chunkIndex: number;
    pageNumber: number;
  }[];
}

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

    const rawResponse = await this.openAiService.generateAnswers(
      context,
      query,
    );

    const sources: ParsedResponse['sources'] = [];

    if (!rawResponse) {
      return {
        answer: "Couldn't generate the answer",
        sources,
      };
    }

    const parts = rawResponse.split(/\n\s*Sources:\s*/i);

    const answer = parts[0].trim();
    const rawSourcesBlock = parts[1] || '';

    if (answer === "I couldn't find that information in the document.") {
      return {
        answer,
        sources,
      };
    }

    if (rawSourcesBlock) {
      // Expect lines like: [1]
      const sourceRegex = /^\s*\[\s*(\d+)\s*\]\s*$/gm;
      let match: RegExpExecArray | null;

      while ((match = sourceRegex.exec(rawSourcesBlock)) !== null) {
        const id = match[1] ? parseInt(match[1].trim()) : -1;

        if (id !== -1 && id <= relevantChunks.length) {
          sources.push({
            id,
            chunkIndex: relevantChunks[id - 1].chunkIndex,
            pageNumber: relevantChunks[id - 1].pageNumber,
          });
        }
      }
    }

    return {
      answer,
      sources,
    };
  }
}
