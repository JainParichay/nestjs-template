import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { SwaggerProvider } from '@/providers/swagger/swagger.provider';
import { formatCode, runMigrations } from './run-migrations';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
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
    runMigrations();
    formatCode();
    
    // Enable CORS with all origins
    app.enableCors({
      origin: true, // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: '*',
    });

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
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
