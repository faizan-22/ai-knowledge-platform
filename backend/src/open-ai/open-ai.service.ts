import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateEmbeddings(content: string) {
    const response = await this.openAi.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });

    const embeddingVector = response.data[0].embedding;
    return embeddingVector;
  }

  async generateAnswers(context: string, question: string) {
    const systemPrompt = `
        You are an assistant answering questions using only the provided document context.

        Rules:
        - Use only the context below.
        - You may make direct logical inferences from the provided context, but do not use outside knowledge.
        - If a question uses different wording than the context, map it to the closest matching concept only when the meaning is clearly equivalent.
        - If the answer is neither stated nor directly implied, say: "I couldn't find that information in the document."
        - Keep the answer concise.
      `;

    const userPrompt = `
        Context:
        ${context}
        
        Question:
        ${question}
      `;

    this.logger.log('Calling OpenAI...');
    const now = Date.now();

    const response = await this.openAi.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}`,
        },
        {
          role: 'user',
          content: `${userPrompt}`,
        },
      ],
    });

    this.logger.log(`OpenAI responded in ${Date.now() - now} ms`);

    return response.choices[0].message.content;
  }
}
