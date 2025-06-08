import { Module } from '@nestjs/common';
import { Base64Service, BcryptService } from './services';

@Module({
  providers: [Base64Service, BcryptService],
  exports: [Base64Service, BcryptService],
})
export class HashModule {}
