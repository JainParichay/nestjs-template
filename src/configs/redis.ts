import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  maxRetries: Number(process.env.REDIS_MAX_RETRIES || 5),
  retryDelay: Number(process.env.REDIS_RETRY_DELAY || 1000),
}));

// export const redisConfigWithPassword = registerAs('redis', () => ({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: Number(process.env.REDIS_PORT || 6379),
//   password: process.env.REDIS_PASSWORD || '',
//   db: process.env.REDIS_DB || 0,
// }));
