import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../db/redis/redis.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async generateAccessToken(user: any) {
    return {
      accessToken: this.jwtService.sign(
        { name: user.name, email: user.email, sub: user.id },
        { expiresIn: '10s' },
      ),
    };
  }

  async generateRefreshToken(user: any) {
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '1m' },
    );

    const redisClient = this.redisService.getClient();
    await redisClient.set(user.id, refreshToken);

    return {
      refreshToken,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const redisClient = this.redisService.getClient();
    const storedRefreshToken = await redisClient.get(userId);

    const decodeRefreshToken = this.jwtService.decode(refreshToken);
    if (decodeRefreshToken.exp && Date.now() >= decodeRefreshToken.exp * 1000) {
      return false;
    }

    return storedRefreshToken === refreshToken;
  }

  async invalidateRefreshToken(userId: string) {
    const redisClient = this.redisService.getClient();
    await redisClient.del(userId.toString());
  }
}
