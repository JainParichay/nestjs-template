import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { OtpStrategy } from './strategies/otp.strategy';
import { AuthController } from './auth.controller';
import { BaseModule } from '@/baseModule';

@Module({
  imports: [PassportModule, BaseModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, OtpStrategy],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
