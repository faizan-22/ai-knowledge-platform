import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateEmbeddings(content: string) {
    const response = await this.openAi.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });

    const embeddingVector = response.data[0].embedding;
    return embeddingVector;
  }
}
