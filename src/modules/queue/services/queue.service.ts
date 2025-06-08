import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '../queue.constants';
import {
  QueueJob,
  QueueJobOptions,
  QueueStats,
  JobStatus,
} from '../interfaces/queue.interface';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.DEFAULT)
    private readonly defaultQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EMAIL)
    private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATION)
    private readonly notificationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SMS)
    private readonly smsQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.setupQueueListeners();
  }

  private setupQueueListeners() {
    [
      this.defaultQueue,
      this.emailQueue,
      this.notificationQueue,
      this.smsQueue,
    ].forEach((queue) => {
      queue.on('error', (error) => {
        this.logger.error(`Queue ${queue.name} error:`, error);
      });

      queue.on('failed', (job: Job, error: Error) => {
        this.logger.error(
          `Job ${job.id} in queue ${queue.name} failed:`,
          error.stack,
        );
      });

      queue.on('completed', (job: Job) => {
        this.logger.debug(
          `Job ${job.id} in queue ${queue.name} completed`,
          job.returnvalue,
        );
      });
    });
  }

  async addToDefaultQueue<T>(
    job: QueueJob<T>,
    options?: QueueJobOptions,
  ): Promise<Job<T>> {
    return this.defaultQueue.add(job.name, job.data, options);
  }

  async addToEmailQueue<T>(
    job: QueueJob<T>,
    options?: QueueJobOptions,
  ): Promise<Job<T>> {
    return this.emailQueue.add(job.name, job.data, options);
  }

  async addToNotificationQueue<T>(
    job: QueueJob<T>,
    options?: QueueJobOptions,
  ): Promise<Job<T>> {
    return this.notificationQueue.add(job.name, job.data, options);
  }

  async addToSmsQueue<T>(
    job: QueueJob<T>,
    options?: QueueJobOptions,
  ): Promise<Job<T>> {
    return this.smsQueue.add(job.name, job.data, options);
  }

  async getJobStatus(queueName: string, jobId: string): Promise<JobStatus> {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    const state = await job.getState();
    const progress = await job.progress();
    const attemptsMade = job.attemptsMade;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      name: job.name,
      state,
      progress,
      attemptsMade,
      failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  async getQueueStats(queueName: string): Promise<QueueStats> {
    const queue = this.getQueueByName(queueName);
    const [active, waiting, completed, failed, delayed] = await Promise.all([
      queue.getActiveCount(),
      queue.getWaitingCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      active,
      waiting,
      completed,
      failed,
      delayed,
    };
  }

  async cleanQueue(
    queueName: string,
    grace: number = 1000 * 60 * 60 * 24, // 24 hours
  ): Promise<void> {
    const queue = this.getQueueByName(queueName);
    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
  }

  private getQueueByName(queueName: string): Queue {
    switch (queueName) {
      case QUEUE_NAMES.DEFAULT:
        return this.defaultQueue;
      case QUEUE_NAMES.EMAIL:
        return this.emailQueue;
      case QUEUE_NAMES.NOTIFICATION:
        return this.notificationQueue;
      case QUEUE_NAMES.SMS:
        return this.smsQueue;
      default:
        throw new Error(`Queue ${queueName} not found`);
    }
  }
}
