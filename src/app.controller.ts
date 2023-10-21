import { Controller, Get } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { Public } from './modules/auth/models/public.constants';
@Controller()
export class AppController {
  @Public()
  @Get('')
  getInfo(@RealIP() ip: string) {
    return {
      version: process.env.npm_package_version,
      env: process.env.NODE_ENV,
      ip,
      date: new Date().toISOString(),
    };
  }
}
