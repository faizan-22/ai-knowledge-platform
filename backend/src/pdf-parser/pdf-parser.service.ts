import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import pdfParse from 'pdf-parse-new';
import fs from 'fs/promises';

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  async parsePdf(fileName: string) {
    try {
      const filePath = join(process.cwd(), 'uploads', fileName);
      const fileBuffer = await fs.readFile(filePath);

      const data = await pdfParse(fileBuffer);
      return data;
    } catch (err) {
      this.logger.error(err);
    }
  }
}
