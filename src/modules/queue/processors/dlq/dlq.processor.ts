import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('dlq')
export class DlqProcessor {
  private readonly logger = new Logger(DlqProcessor.name);

  @Process('failed-job')
  async handleFailedJob(job: Job) {
    this.logger.error(
      `Processing failed job from queue ${job.data.queueName}`,
      {
        jobId: job.id,
        jobName: job.name,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        data: job.data,
      },
    );

    // Here you can:
    // 1. Store failed jobs in a database
    // 2. Send notifications
    // 3. Attempt recovery
    // 4. Generate reports

    return {
      processed: true,
      timestamp: new Date().toISOString(),
    };
  }
}
