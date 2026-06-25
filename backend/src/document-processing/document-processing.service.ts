import { Injectable, Logger } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { TextChunkerService } from './text-chunker.service';

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);
  constructor(
    private readonly pdfParserService: PdfParserService,
    private readonly textChunkerService: TextChunkerService,
  ) {}

  async processDocument(fileName: string, documentId: number) {
    try {
      if (!documentId) throw Error('documentId undefined!');

      const content: { page: number; text: string }[] | undefined =
        await this.pdfParserService.parsePdf(fileName);

      let chunkStartIndex = 0;

      if (content) {
        for (const pageContent of content) {
          const nextIndex = await this.textChunkerService.chunkText(
            pageContent,
            documentId,
            chunkStartIndex,
          );
          if (typeof nextIndex === 'number') {
            chunkStartIndex = nextIndex;
          }
        }
      }
    } catch (err) {
      this.logger.error(err);
    }
  }
}
