import { LogtoExpressConfig } from '@logto/express';

export const logtoConfig: LogtoExpressConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || 'https://logto.jainparichay.online',
  appId: process.env.LOGTO_APP_ID || 'logto',
  appSecret: process.env.LOGTO_APP_SECRET || 'secret',
  baseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
};
