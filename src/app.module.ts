import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './modules/config/config.module';
import { LogModule } from './modules/log/log.module';
import { CorrelationIdMiddleware } from './modules/log/correlation/correlation-id.middleware';
import { PrismaService } from './modules/db/prisma/prisma.service';
import { UserService } from './users/user.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule, LogModule, UsersModule],
  controllers: [AppController],
  providers: [PrismaService, UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
