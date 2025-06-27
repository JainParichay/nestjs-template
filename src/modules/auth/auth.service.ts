import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { RedisProvider } from '@/providers/redis/redis.provider';
import { Base64Service } from '@/providers/hash/services/base64.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    private redisProvider: RedisProvider,
    private base64Service: Base64Service,
  ) {}

  // TODO: Implement your OTP sending logic here
  async sendOtp(mobileNumber: string): Promise<void> {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = this.configService.get('auth.otpExpiresIn', 300); // Default 5 minutes

    // Hash the OTP before storing
    const hashedOtp = this.base64Service.toBase64(otp);

    // Store the hashed OTP in Redis
    await this.redisProvider.set(`otp:${mobileNumber}`, hashedOtp, expiresIn);

    // TODO: Implement your OTP sending logic here
    // For example, sending via WhatsApp or SMS
    console.log(`OTP for ${mobileNumber}: ${otp}`); // Remove this in production
  }

  async verifyOtp(
    mobileNumber: string,
    otp: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const storedHashedOtp = await this.redisProvider.get(`otp:${mobileNumber}`);

    if (!storedHashedOtp) {
      throw new UnauthorizedException('OTP not found or expired');
    }

    // Verify the OTP
    const hashedOtp = this.base64Service.toBase64(otp);
    if (hashedOtp !== storedHashedOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Clear the OTP after successful verification
    await this.redisProvider.del(`otp:${mobileNumber}`);

    // Generate and return both tokens
    // In a real application, you would first get or create the user
    const userId = mobileNumber; // Replace with actual user ID from your user service
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(userId),
      this.tokenService.generateRefreshToken(userId),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.tokenService.validateRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke the old refresh token
    await this.tokenService.revokeRefreshToken(refreshToken);

    // Generate new tokens
    const [accessToken, newRefreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(payload.userId),
      this.tokenService.generateRefreshToken(payload.userId),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.tokenService.validateRefreshToken(refreshToken);
    if (payload) {
      await this.tokenService.revokeAllUserTokens(payload.userId);
    }
  }

  async validateToken(token: string): Promise<{ userId: string } | null> {
    return this.tokenService.validateToken(token);
  }
}
