import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CorrelationService } from './correlation/correlation.service';

@Injectable({ scope: Scope.REQUEST })
export class LogService extends PinoLogger {
  constructor(
    private readonly name: unknown,
    private readonly correlationService: CorrelationService,
  ) {
    super(name);
    this.assign({ requestId: this.correlationService.getCorrelationId() });
  }
  log(message, ...optionalParams) {
    this.info(optionalParams, message);
  }
}
