import { Injectable, Logger } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { TextChunkerService } from './text-chunker.service';
import { EmbeddingsService } from './embeddings.service';
import { DatabaseService } from 'src/database/database.service';
import { FileStatus } from '@prisma/client';

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly pdfParserService: PdfParserService,
    private readonly textChunkerService: TextChunkerService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async processDocument(fileName: string, documentId: number) {
    try {
      if (!documentId) throw Error('documentId undefined!');

      // Change the status to PROCESSING
      await this.databaseService.document.update({
        where: {
          id: documentId,
        },
        data: { status: FileStatus.PROCESSING },
      });

      // Parse the PDF and get the pdfContent
      const pdfContent: { page: number; text: string }[] | undefined =
        await this.pdfParserService.parsePdf(fileName);

      let allChunks: { content: string; pageNumber: number }[] = [];

      // Chunk the document page-wise
      if (pdfContent) {
        for (const pageContent of pdfContent) {
          const pageChunks =
            await this.textChunkerService.chunkText(pageContent);
          if (pageChunks) allChunks.push(...pageChunks);
        }
      }

      // Generate embeddings for each chunk and store them in the DB
      let chunkIdx = 0;
      for (const chunk of allChunks) {
        const embeddingVector = await this.embeddingsService.generateEmbeddings(
          chunk.content,
        );
        const vectorString = `[${embeddingVector.join(',')}]`;

        await this.databaseService.$executeRaw`
         INSERT INTO "DocumentChunk"
         (content, "chunkIndex", "pageNumber", "documentId", "embedding")
         VALUES 
         (${chunk.content}, ${chunkIdx}, ${chunk.pageNumber}, ${documentId}, ${vectorString}::vector)
        `;

        chunkIdx += 1;
      }

      // If everything is successful, change the status to ready
      await this.databaseService.document.update({
        where: {
          id: documentId,
        },
        data: { status: FileStatus.READY },
      });
    } catch (err) {
      this.logger.error(err);
      // If any error was thrown, change the status to failed
      await this.databaseService.document.update({
        where: {
          id: documentId,
        },
        data: { status: 'FAILED' },
      });

      throw err;
    }
  }
}
