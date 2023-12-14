import { Redis } from 'ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../../config/models/redis.config';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get<RedisConfig>('redis');
    this.client = new Redis({
      host: redisConfig?.host,
      port: redisConfig?.port,
      username: redisConfig?.username,
      password: redisConfig?.password,
    });
  }

  getClient(): Redis {
    return this.client;
  }
}
