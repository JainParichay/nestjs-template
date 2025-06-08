import { Injectable } from '@nestjs/common';

@Injectable()
export class Base64Service {
  toBase64(data: string | Buffer): string {
    if (typeof data === 'string') {
      return Buffer.from(data).toString('base64');
    }
    return data.toString('base64');
  }
  fromBase64(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
  }

  fromBase64Buffer(data: string): Buffer {
    return Buffer.from(data, 'base64');
  }
}
