import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { dbConfig } from './db';
import { redisConfig } from './redis';
import { globalConfig } from './global';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfig, dbConfig, redisConfig],
      envFilePath: '.env',
    }),
  ],
})
export class ConfigModule {}
