import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaModule } from '../db/prisma/prisma.module';

@Module({
  imports: [PrismaModule, TerminusModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
