import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './modules/config/config.module';
import { LogModule } from './modules/log/log.module';
import { CorrelationIdMiddleware } from './modules/log/correlation/correlation-id.middleware';
import { PrismaService } from './modules/db/prisma/prisma.service';
import { UserService } from './users/user.service';
import { UsersModule } from './users/users.module';
import { HealthModule } from './modules/health/health.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule, LogModule, UsersModule, HealthModule],
  controllers: [AppController],
  providers: [PrismaService, UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
