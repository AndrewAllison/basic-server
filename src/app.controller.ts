import { Controller, Get } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { Public } from './modules/auth/models/public.constants';
import { LogService } from './modules/log/log.service';

@Controller()
export class AppController {
  constructor(private readonly logger: LogService) {}
  @Public()
  @Get('')
  getInfo(@RealIP() ip: string) {
    this.logger.info(
      {
        version: process.env.npm_package_version,
        env: process.env.NODE_ENV,
        ip,
        date: new Date().toISOString(),
      },
      'Application Check',
    );

    return {
      version: process.env.npm_package_version,
      env: process.env.NODE_ENV,
      ip,
      date: new Date().toISOString(),
    };
  }
}
