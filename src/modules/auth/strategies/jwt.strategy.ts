import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from '../../config/models/jwt.config';
import { jwtCookieAccessTokenExtractor } from '../utils/cookie-extractors';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtConfig = configService.get<JwtConfig>('jwt');
    super({
      jwtFromRequest: jwtCookieAccessTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConfig?.secret,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
