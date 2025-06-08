import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './services/queue.service';
import { EmailProcessor } from './processors/email/email.processor';
import { SmsProcessor } from './processors/sms/sms.processor';
import { QUEUE_NAMES } from './queue.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.DEFAULT,
      },
      {
        name: QUEUE_NAMES.EMAIL,
      },
      {
        name: QUEUE_NAMES.NOTIFICATION,
      },
      {
        name: QUEUE_NAMES.SMS,
      },
    ),
  ],
  providers: [QueueService, EmailProcessor, SmsProcessor],
  exports: [QueueService],
})
export class QueueModule {}
