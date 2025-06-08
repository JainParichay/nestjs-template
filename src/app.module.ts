import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { BaseModule } from '@/baseModule';
import { ConfigModule } from '@/configs/config.module';
import { HealthModule } from '@/health/health.module';
import { SwaggerModule } from '@/providers/swagger/swagger.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
        autoLogging: false,
      },
    }),
    BaseModule,
    HealthModule,
    SwaggerModule,
  ],
})
export class AppModule {}
