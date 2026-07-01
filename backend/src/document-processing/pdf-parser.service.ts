/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import pdfParse from 'pdf-parse-new';
import fs from 'fs/promises';

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  async customPageRenderer(pageData: any, pageTexts: any): Promise<string> {
    const renderOptions = {
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    };

    const textContent = await pageData.getTextContent(renderOptions);
    this.logger.log(textContent.items);
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();
    pageTexts.push({ page: pageData.pageNumber, text });
    return text;
  }

  async parsePdf(fileName: string) {
    const filePath = join(process.cwd(), 'uploads', fileName);
    const fileBuffer = await fs.readFile(filePath);

    const pageTexts: { page: number; text: string }[] = [];

    await pdfParse(fileBuffer, {
      verbosityLevel: 0,
      pagerender: (pageData) => this.customPageRenderer(pageData, pageTexts),
    });
    return pageTexts;
  }
}
