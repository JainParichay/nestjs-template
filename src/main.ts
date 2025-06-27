declare const module: any;

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { SwaggerProvider } from '@/providers/swagger/swagger.provider';
import { formatCode, runMigrations } from './run-migrations';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import * as session from 'express-session';
import { handleAuthRoutes } from '@logto/express';
import { logtoConfig } from './configs/logto';
import { RedisProvider } from './providers/redis/redis.provider';
import { RedisStore } from 'connect-redis';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
    });

    app.useLogger(app.get(Logger));

    const configService = app.get(ConfigService);
    const port = configService.get('global.port', 3000);
    const nodeEnv = configService.get('global.nodeEnv');
    const isDev = configService.get('global.isDevelopment');

    const getBaseUrl = () => {
      const baseUrl = configService.get('global.baseUrl', '');
      if (baseUrl) {
        return baseUrl;
      }
      return '';
    };

    // Run migrations
    if (isDev) {
      formatCode();
    } else {
      runMigrations();
    }
    // Enable CORS with all origins
    app.enableCors({
      origin: true, // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: '*',
    });

    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    app.use(cookieParser());

    app.use(
      session({
        store: new RedisStore({ client: app.get(RedisProvider).getClient() }),
        secret: configService.get('global.sessionSecret'),
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
      }),
    );

    app.use(handleAuthRoutes(logtoConfig));

    // Setup Swagger
    if (isDev) {
      const swaggerProvider = new SwaggerProvider(
        app,
        configService,
        app.get(Logger),
      );
      swaggerProvider.setup();
    }

    await app.listen(port);

    setTimeout(async () => {
      console.log(
        `Application is running on: ${await app.getUrl()} \nbaseUrl: ${getBaseUrl()}\nEnvironment: ${nodeEnv}`,
      );
      console.log(
        `Swagger documentation is available at: ${await app.getUrl()}/api`,
      );
    }, 1000);

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
