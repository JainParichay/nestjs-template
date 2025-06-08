import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { RedisProvider } from '@/providers/redis/redis.provider';

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService,
    private redisProvider: RedisProvider,
  ) {}

  async generateAccessToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresIn = this.configService.get('auth.tokenExpiresIn', 3600); // Default 1 hour

    await this.redisProvider.set(
      `token:${token}`,
      JSON.stringify({ userId, type: 'access' }),
      expiresIn,
    );

    return token;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresIn = this.configService.get(
      'auth.refreshTokenExpiresIn',
      604800,
    ); // Default 7 days

    await this.redisProvider.set(
      `refresh:${token}`,
      JSON.stringify({ userId, type: 'refresh' }),
      expiresIn,
    );

    return token;
  }

  async validateToken(token: string): Promise<{ userId: string } | null> {
    const tokenData = await this.redisProvider.get(`token:${token}`);
    if (!tokenData) return null;

    const data = JSON.parse(tokenData);
    if (data.type !== 'access') return null;

    return { userId: data.userId };
  }

  async validateRefreshToken(
    token: string,
  ): Promise<{ userId: string } | null> {
    const tokenData = await this.redisProvider.get(`refresh:${token}`);
    if (!tokenData) return null;

    const data = JSON.parse(tokenData);
    if (data.type !== 'refresh') return null;

    return { userId: data.userId };
  }

  async revokeToken(token: string): Promise<void> {
    await this.redisProvider.del(`token:${token}`);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.redisProvider.del(`refresh:${token}`);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    let cursor = '0';
    const patterns = ['token:*', 'refresh:*'];

    do {
      for (const pattern of patterns) {
        const [nextCursor, keys] = await this.redisProvider.scan(
          parseInt(cursor),
          pattern,
        );
        cursor = nextCursor;

        for (const key of keys) {
          const data = await this.redisProvider.get(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.userId === userId) {
              await this.redisProvider.del(key);
            }
          }
        }
      }
    } while (cursor !== '0');
  }
}
