import { Module } from '@nestjs/common';
import { FrontendController } from './frontend.controller';

@Module({
  imports: [],
  controllers: [FrontendController],
  providers: [],
  exports: [],
})
export class FrontendModule {}
