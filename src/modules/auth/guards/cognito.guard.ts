import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CognitoJwtStrategy } from '../strategies/cognito.strategy';
import { IS_PUBLIC_KEY } from '../models/public.decorator';
import { Reflector } from '@nestjs/core';
import { jwtCookieRefreshTokenExtractor } from '../utils/cookie-extractors';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(
    private readonly cognitoJwtStrategy: CognitoJwtStrategy,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = jwtCookieRefreshTokenExtractor(request);

    if (!token) {
      return false;
    }

    return this.cognitoJwtStrategy
      .validateToken(token)
      .then(() => true)
      .catch(() => false);
  }
}
