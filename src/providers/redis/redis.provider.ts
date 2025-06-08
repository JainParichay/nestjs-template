import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedisProvider implements OnModuleInit, OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly logger: Logger;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private retryCount: number = 0;
  private subscribers: Map<string, Redis> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly pinoLogger: Logger,
  ) {
    this.logger = pinoLogger;
    this.maxRetries = this.configService.get('redis.maxRetries');
    this.retryDelay = this.configService.get('redis.retryDelay');

    // this.redisClient = new Redis({
    //   host: this.configService.get('redis.host'),
    //   port: this.configService.get('redis.port'),
    //   password: this.configService.get('redis.password'),
    //   db: this.configService.get('redis.db'),
    //   retryStrategy: this.retryStrategy.bind(this),
    //   maxRetriesPerRequest: 3,
    //   enableReadyCheck: true,
    //   reconnectOnError: (err) => {
    //     const targetError = 'READONLY';
    //     if (err.message.includes(targetError)) {
    //       return true;
    //     }
    //     return false;
    //   },
    // });

    this.redisClient = new Redis(this.configService.get('redis.url'), {
      retryStrategy: this.retryStrategy.bind(this),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    this.setupEventListeners();
  }

  private retryStrategy(times: number): number | null {
    if (times > this.maxRetries) {
      this.logger.error(
        `Redis connection failed after ${this.maxRetries} retries`,
      );
      return null; // Stop retrying
    }

    const delay = Math.min(times * this.retryDelay, 30000); // Max delay of 30 seconds
    this.logger.warn(
      `Redis connection attempt ${times} failed. Retrying in ${delay}ms...`,
    );
    return delay;
  }

  private setupEventListeners() {
    // Connection Events
    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected');
      this.retryCount = 0; // Reset retry count on successful connection
    });

    this.redisClient.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error(`Redis client error: ${error.message}`);
      this.handleError(error);
    });

    this.redisClient.on('close', () => {
      this.logger.warn('Redis client connection closed');
    });

    this.redisClient.on('reconnecting', () => {
      this.retryCount++;
      this.logger.warn(
        `Redis client reconnecting... Attempt ${this.retryCount}`,
      );
    });

    // Command Events
    this.redisClient.on('command', (command) => {
      this.logger.debug(`Redis command executed: ${command}`);
    });
  }

  private async handleError(error: Error) {
    if (error.message.includes('ECONNREFUSED')) {
      this.logger.error(
        'Redis connection refused. Check if Redis server is running.',
      );
    } else if (error.message.includes('WRONGPASS')) {
      this.logger.error(
        'Redis authentication failed. Check password configuration.',
      );
    } else if (error.message.includes('READONLY')) {
      this.logger.error(
        'Redis is in read-only mode. Check Redis configuration.',
      );
    }

    // Implement exponential backoff for retries
    if (this.retryCount < this.maxRetries) {
      const delay = Math.min(
        Math.pow(2, this.retryCount) * this.retryDelay,
        30000,
      );
      this.logger.warn(`Retrying connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      this.retryCount++;
    } else {
      this.logger.error(
        'Max retry attempts reached. Please check Redis configuration and server status.',
      );
    }
  }

  async onModuleInit() {
    try {
      await this.redisClient.ping();
      this.logger.log('Redis connection established successfully');
    } catch (error) {
      this.logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    for (const subscriber of this.subscribers.values()) {
      await subscriber.quit();
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  // Helper methods for common Redis operations with retry logic
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redisClient.set(key, value, 'EX', ttl);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async setJson(key: string, value: any): Promise<void> {
    try {
      await this.redisClient.set(key, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async getJson(key: string): Promise<any | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async mget(keys: string[]): Promise<string[] | null> {
    try {
      return await this.redisClient.mget(keys);
    } catch (error) {
      this.logger.error(`Error getting keys ${keys}: ${error.message}`);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Error checking existence of key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}: ${error.message}`);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.redisClient.decr(key);
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}: ${error.message}`);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redisClient.expire(key, ttl);
    } catch (error) {
      this.logger.error(
        `Error setting expiry for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}: ${error.message}`);
      throw error;
    }
  }

  async subscribe(
    channel: string,
    callback: (message: string | Error, channel: string) => void,
  ): Promise<void> {
    try {
      const subscriber = this.redisClient.duplicate();
      await subscriber.connect();

      await subscriber.subscribe(channel, (message) => {
        callback(message, channel);
      });

      this.subscribers.set(channel, subscriber);
    } catch (error) {
      this.logger.error(
        `Error subscribing to channel ${channel}: ${error.message}`,
      );
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      const subscriber = this.subscribers.get(channel);
      if (subscriber) {
        await subscriber.unsubscribe(channel);
        await subscriber.quit();
        this.subscribers.delete(channel);
      }
    } catch (error) {
      this.logger.error(
        `Error unsubscribing from channel ${channel}: ${error.message}`,
      );
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return false;
    }
  }

  // Hash Operations
  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.redisClient.hset(key, field, value);
    } catch (error) {
      this.logger.error(
        `Error setting hash field ${field} for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redisClient.hget(key, field);
    } catch (error) {
      this.logger.error(
        `Error getting hash field ${field} for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redisClient.hgetall(key);
    } catch (error) {
      this.logger.error(
        `Error getting all hash fields for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.redisClient.hdel(key, field);
    } catch (error) {
      this.logger.error(
        `Error deleting hash field ${field} for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  // List Operations
  async lpush(key: string, value: string): Promise<void> {
    try {
      await this.redisClient.lpush(key, value);
    } catch (error) {
      this.logger.error(`Error pushing to list ${key}: ${error.message}`);
      throw error;
    }
  }

  async rpush(key: string, value: string): Promise<void> {
    try {
      await this.redisClient.rpush(key, value);
    } catch (error) {
      this.logger.error(`Error pushing to list ${key}: ${error.message}`);
      throw error;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redisClient.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(
        `Error getting range from list ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  // Set Operations
  async sadd(key: string, member: string): Promise<void> {
    try {
      await this.redisClient.sadd(key, member);
    } catch (error) {
      this.logger.error(`Error adding member to set ${key}: ${error.message}`);
      throw error;
    }
  }

  async srem(key: string, member: string): Promise<void> {
    try {
      await this.redisClient.srem(key, member);
    } catch (error) {
      this.logger.error(
        `Error removing member from set ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redisClient.smembers(key);
    } catch (error) {
      this.logger.error(
        `Error getting members of set ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  // Sorted Set Operations
  async zadd(key: string, score: number, member: string): Promise<void> {
    try {
      await this.redisClient.zadd(key, score, member);
    } catch (error) {
      this.logger.error(
        `Error adding member to sorted set ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redisClient.zrange(key, start, stop);
    } catch (error) {
      this.logger.error(
        `Error getting range from sorted set ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  // Pipeline Operations
  async pipeline(operations: Array<() => Promise<any>>): Promise<any[]> {
    try {
      const pipeline = this.redisClient.pipeline();
      for (const operation of operations) {
        await operation();
      }
      return await pipeline.exec();
    } catch (error) {
      this.logger.error(
        `Error executing pipeline operations: ${error.message}`,
      );
      throw error;
    }
  }

  // Scan Operations (for large datasets)
  async scan(
    cursor: number,
    pattern: string,
    count: number = 100,
  ): Promise<[string, string[]]> {
    try {
      return await this.redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        count,
      );
    } catch (error) {
      this.logger.error(
        `Error scanning keys with pattern ${pattern}: ${error.message}`,
      );
      throw error;
    }
  }
}
