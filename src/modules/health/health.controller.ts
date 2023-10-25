import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../db/prisma/prisma.service';
import { ApiTags } from '@nestjs/swagger';

// https://github.com/nestjs/terminus/tree/master/sample - for more info and samples go here
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @ApiTags('Server')
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.http.pingCheck('network-status', 'https://docs.nestjs.com'),
    ]);
  }
}
