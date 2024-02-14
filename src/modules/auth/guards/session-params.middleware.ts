// session-params.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class SessionParamsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    // Modify the request session before Passport strategy
    if (req.query.returnTo) {
      req.session.redirectUrl = req.query.returnTo;
    }
    next();
  }
}
