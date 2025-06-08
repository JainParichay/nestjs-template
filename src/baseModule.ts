import { Module } from '@nestjs/common';
import { PrismaModule } from '@/providers/prisma/prisma.module';
import { RedisModule } from '@/providers/redis/redis.module';
import { HashModule } from '@/providers/hash/hash.module';

@Module({
  imports: [PrismaModule, RedisModule, HashModule],
  providers: [],
  exports: [PrismaModule, RedisModule, HashModule],
})
export class BaseModule {}
