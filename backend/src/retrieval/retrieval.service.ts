import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { OpenAiService } from 'src/open-ai/open-ai.service';

export type RetrievedChunk = {
  id: number;
  content: string;
  pageNumber: number;
  documentId: number;
  distance: number;
};

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly openAiService: OpenAiService,
  ) {}

  async retrieveChunks(
    userId: number,
    targetDocumentId: number,
    query: string,
    topK = 5,
  ): Promise<RetrievedChunk[]> {
    const document = await this.databaseService.document.findUnique({
      where: {
        userId,
        id: targetDocumentId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found!');
    }

    const queryEmbedding = await this.openAiService.generateEmbeddings(query);
    const vectorString = `[${queryEmbedding.join(',')}]`;

    const matchedChunks = await this.databaseService.$queryRaw<
      RetrievedChunk[]
    >`
        SELECT
        id, 
        content, 
        "pageNumber",
        "documentId",
        "embedding" <=> ${vectorString}::vector AS distance
        FROM "DocumentChunk"
        WHERE "documentId" = ${targetDocumentId}
        ORDER BY distance ASC
        LIMIT ${topK};
      `;

    return matchedChunks;
  }
}
