import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DocumentProcessingService } from './document-processing.service';
import { DatabaseService } from 'src/database/database.service';
import { FileStatus } from '@prisma/client';

export interface jobType {
  id: number;
  filePath: string;
}

@Processor('document-processing', { concurrency: 1 })
export class DocumentProcessingWorker extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessingWorker.name);

  constructor(
    private readonly documentProcessingService: DocumentProcessingService,
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

  async process(job: Job<jobType, any, string>): Promise<any> {
    try {
      switch (job.name) {
        case 'process': {
          this.logger.log(`Starting job ${job.id}: Processing document...`);
          this.logger.log(
            `documentId: ${job.data?.id}, filepath: ${job.data?.filePath}`,
          );

          // 1. Simulate or perform actual async work here
          await this.documentProcessingService.processDocument(
            job.data.filePath,
            job.data.id,
          );

          // 2. Explicitly return a result so BullMQ knows it succeeded
          return { success: true, processedAt: new Date() };
        }

        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
          throw new Error(`Job name ${job.name} not supported`);
      }
    } catch (err) {
      // If any error was thrown in all the attempts, change the status to failed
      if (
        job.opts.attempts == undefined ||
        job.attemptsMade >= job.opts.attempts - 1
      ) {
        this.logger.log('Closing this job permanantly');
        await this.databaseService.document.update({
          where: {
            id: job.data?.id,
          },
          data: { status: FileStatus.FAILED },
        });
      }
      this.logger.error(
        `${job.attemptsMade + 1} Attempt(s) failed for jobId ${job.id}, documentId: ${job.data?.id}`,
      );

      throw err;
    }
  }

  // Quick helper to simulate a 2-second file/database operation
  private simulateHeavyWork(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
