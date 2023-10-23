import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { CorrelationService } from './correlation.service';
import { CORRELATION_ID_HEADER } from './constants';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly correlationService: CorrelationService) {}
  use(req: Request, res: Response) {
    const requestId = req.header[CORRELATION_ID_HEADER] || uuid();
    res.setHeader(CORRELATION_ID_HEADER, requestId);
    this.correlationService.setCorrelationId(requestId);
    req.next();
  }
}
