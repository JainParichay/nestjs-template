import { Module } from '@nestjs/common';
import { SwaggerProvider } from './swagger.provider';

@Module({
  providers: [SwaggerProvider],
  exports: [SwaggerProvider],
})
export class SwaggerModule {}
