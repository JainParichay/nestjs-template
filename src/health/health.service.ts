import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import pino from 'pino';
import { PrismaProvider } from '@/providers/prisma/prisma.provider';
import { RedisProvider } from '@/providers/redis/redis.provider';

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  latency?: number;
  error?: string;
  services: {
    database: {
      status: string;
      latency: number;
      error?: string;
    };
    redis: {
      status: string;
      latency: number;
      error?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private logStream: any;
  private logs: string[] = [];
  private readonly MAX_LOGS = 1000;

  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaProvider,
    private readonly redis: RedisProvider,
  ) {
    // Create a write stream to capture logs
    this.logStream = pino({
      browser: {
        write: (obj) => {
          const logEntry = JSON.stringify(obj);
          this.logs.push(logEntry);
          // Keep only the last MAX_LOGS entries
          if (this.logs.length > this.MAX_LOGS) {
            this.logs.shift();
          }
        },
      },
    });
  }

  async getLogs() {
    try {
      return {
        status: 'success',
        message: 'Logs retrieved successfully',
        logs: this.logs,
      };
    } catch (error) {
      this.logger.error('Error retrieving logs:', error);
      return {
        status: 'error',
        message: 'Error retrieving logs',
        error: error.message,
      };
    }
  }

  private formatError(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error?.message) {
      return error.message;
    }
    return JSON.stringify(error);
  }

  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    const health: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: 'unknown',
          latency: 0,
        },
        redis: {
          status: 'unknown',
          latency: 0,
        },
      },
    };

    try {
      // Check Prisma Database
      const dbStartTime = Date.now();
      try {
        const dbHealth = await this.prisma.healthCheck();
        const dbLatency = Date.now() - dbStartTime;

        health.services.database = {
          status: dbHealth ? 'ok' : 'error',
          latency: dbLatency,
        };
      } catch (dbError) {
        const dbLatency = Date.now() - dbStartTime;
        this.logger.error('Database health check failed:', dbError);
        health.services.database = {
          status: 'error',
          latency: dbLatency,
          error: this.formatError(dbError),
        };
      }

      // Check Redis
      const redisStartTime = Date.now();
      try {
        const redisHealth = await this.redis.healthCheck();
        const redisLatency = Date.now() - redisStartTime;

        health.services.redis = {
          status: redisHealth ? 'ok' : 'error',
          latency: redisLatency,
        };
      } catch (redisError) {
        const redisLatency = Date.now() - redisStartTime;
        this.logger.error('Redis health check failed:', redisError);
        health.services.redis = {
          status: 'error',
          latency: redisLatency,
          error: this.formatError(redisError),
        };
      }

      // Overall status
      health.status =
        health.services.database.status === 'ok' &&
        health.services.redis.status === 'ok'
          ? 'ok'
          : 'error';

      health.latency = Date.now() - startTime;

      return health;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        ...health,
        status: 'error',
        error: this.formatError(error),
        latency: Date.now() - startTime,
      };
    }
  }
}
