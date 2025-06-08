import { registerAs } from '@nestjs/config';

export const dbConfig = registerAs('db', () => ({
  url: process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres',
  maxRetries: Number(process.env.DATABASE_MAX_RETRIES || 5),
  retryDelay: Number(process.env.DATABASE_RETRY_DELAY || 1000),
}));

// export const dbConfigWithPassword = registerAs('db', () => ({
//   host: process.env.DATABASE_HOST || 'localhost',
//   port: Number(process.env.DATABASE_PORT || 5432),
//   username: process.env.DATABASE_USERNAME || 'postgres',
//   password: process.env.DATABASE_PASSWORD || '',
//   database: process.env.DATABASE_NAME || 'postgres',
//   ssl: process.env.DATABASE_SSL === 'true',
// }));
