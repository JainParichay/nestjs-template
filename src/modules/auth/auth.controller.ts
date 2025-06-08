import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body('mobileNumber') mobileNumber: string) {
    await this.authService.sendOtp(mobileNumber);
    return { message: 'OTP sent successfully' };
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body('mobileNumber') mobileNumber: string,
    @Body('otp') otp: string,
  ) {
    const tokens = await this.authService.verifyOtp(mobileNumber, otp);
    return tokens;
  }

  @Post('refresh')
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    const tokens = await this.authService.refreshTokens(refreshToken);
    return tokens;
  }

  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard('otp'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
