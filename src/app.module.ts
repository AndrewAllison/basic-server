import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './modules/config/config.module';
import { LogModule } from './modules/log/log.module';
import { CorrelationIdMiddleware } from './modules/log/correlation/correlation-id.middleware';

@Module({
  imports: [ConfigModule, LogModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
