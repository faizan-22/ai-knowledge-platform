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
    - **Source Citation Rule:** For every statement you make, you must append the source number in square brackets (e.g., [1], [2]) directly to the sentence it supports. At the end of your response, create a list 'Sources:' of all the sources you have used in the response.
    - Keep the answer concise.

    ---
    EXAMPLE 1 (FEW-SHOT):

    Context:
    [Source 1 - Page Number 5] The company wide project deadline has been officially extended to December 15th due to administrative adjustments.
    [Source 2 - Page Number 3] To ensure timely processing, all department team members are strictly required to submit their final financial reports by the extended deadline date.
    [Source 3 - Page Number 8] Our headquarters are situated in Bangalore.

    Question: What is the new timeline for report submission?
    Answer:
    The project deadline has been extended to December 15th [1]. All team members are required to submit their final reports by this date to ensure timely processing [2].
    Sources:
    [1]
    [2]
    ---

    Please process the following request using the rules and example format above:
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
