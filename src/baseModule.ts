import { Module } from '@nestjs/common';
import { PrismaModule } from '@/providers/prisma/prisma.module';
import { RedisModule } from '@/providers/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [],
  exports: [PrismaModule, RedisModule],
})
export class BaseModule {}
