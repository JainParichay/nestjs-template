import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

export class SwaggerProvider {
  constructor(
    private readonly app: INestApplication,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  setup() {
    try {
      const baseUrl = this.configService.get<string>('global.baseUrl');
      console.log('baseUrl', baseUrl);
      const config = new DocumentBuilder()
        .setTitle('NestJS Template API')
        .setDescription('The NestJS Template API documentation')
        .setVersion('1.0')
        .addServer(baseUrl || '')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(this.app, config);
      const path = 'api';

      SwaggerModule.setup(path, this.app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
        customSiteTitle: 'NestJS Template API Documentation',
      });

      this.logger.log(`Swagger documentation is available at /${path}`);
    } catch (error) {
      this.logger.error('Failed to setup Swagger:', error.message);
      throw error;
    }
  }
}
