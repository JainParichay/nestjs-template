import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

@Injectable()
export class PrismaProvider
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private retryCount: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly pinoLogger: Logger,
  ) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    this.logger = this.pinoLogger;
    this.maxRetries = this.configService.get('database.maxRetries') || 3;
    this.retryDelay = this.configService.get('database.retryDelay') || 1000;
  }

  private async handleError(error: Error): Promise<void> {
    if (this.shouldRetry(error)) {
      if (this.retryCount < this.maxRetries) {
        const delay = this.calculateRetryDelay();
        this.logger.warn(
          `Database error occurred. Retrying in ${delay}ms... (Attempt ${this.retryCount + 1}/${this.maxRetries})`,
        );
        await this.sleep(delay);
        this.retryCount++;
        return;
      }
    }
    this.retryCount = 0;
    throw error;
  }

  private shouldRetry(error: Error): boolean {
    // List of errors that should trigger a retry
    const retryableErrors = [
      'P1001', // Connection error
      'P1002', // Connection timed out
      'P1008', // Connection timeout
      'P1017', // Server closed the connection
      'P2024', // Connection timeout
      'P2034', // Transaction failed
    ];

    return (
      error instanceof Error &&
      retryableErrors.some((code) => error.message.includes(code))
    );
  }

  private calculateRetryDelay(): number {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      this.retryDelay * Math.pow(2, this.retryCount),
      30000, // Max delay of 30 seconds
    );
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    return exponentialDelay + jitter;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
      this.retryCount = 0;
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Try to execute a simple query
      await this.$queryRaw`SELECT 1`;
      this.logger.debug('Database health check passed');
      this.retryCount = 0;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:' + error.message, error);
      return false;
    }
  }

  // Wrapper method for executing operations with retry logic
  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    this.retryCount = 0;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        if (!this.shouldRetry(error) || this.retryCount >= this.maxRetries) {
          throw error;
        }
        const delay = this.calculateRetryDelay();
        this.logger.warn(
          `Operation failed. Retrying in ${delay}ms... (Attempt ${this.retryCount + 1}/${this.maxRetries})`,
        );
        await this.sleep(delay);
        this.retryCount++;
      }
    }
  }
}
