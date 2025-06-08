import { registerAs } from '@nestjs/config';

export const globalConfig = registerAs('global', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production' || false,
  isDevelopment: process.env.NODE_ENV === 'development' || true,
  isTest: process.env.NODE_ENV === 'test' || false,

  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  port: Number(process.env.PORT) || 3000,
  apiKey: process.env.API_KEY || 'your-api-key',
  apiSecret: process.env.API_SECRET || 'your-api-secret',
}));
