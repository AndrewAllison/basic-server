import { Controller, Get } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { Public } from './modules/auth/models/public.constants';
import { LogService } from './modules/log/log.service';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

export class InfoResponse {
  @ApiProperty({ example: '0.0.1', description: 'The api release version' })
  version?: string;
  @ApiProperty({ example: 'production', description: 'The api environment' })
  env: string;
  @ApiProperty({ example: '::1', description: 'The requesting users i.p' })
  ip?: string;
  @ApiProperty({
    example: '2023-10-23T12:27:16.821Z',
    description: 'The requesting users i.p',
  })
  date?: string;
}

@ApiTags('Server')
@Controller()
export class AppController {
  constructor(private readonly logger: LogService) {}
  @Public()
  @Get('')
  @ApiResponse({
    status: 200,
    description: 'Server check response',
    type: InfoResponse,
  })
  getInfo(@RealIP() ip: string): InfoResponse {
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
      env: `${process.env.NODE_ENV}`,
      ip,
      date: new Date().toISOString(),
    };
  }
}
