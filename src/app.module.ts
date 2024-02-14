import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from './modules/config/config.module';
import { LogModule } from './modules/log/log.module';
import { CorrelationIdMiddleware } from './modules/log/correlation/correlation-id.middleware';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { HttpModule } from '@nestjs/axios';
import { QueueModule } from './modules/queue/queue.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './modules/auth/auth.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { SessionParamsMiddleware } from './modules/auth/guards/session-params.middleware';
import { CognitoService } from './modules/auth/services/cognito.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    EventEmitterModule.forRoot(),
    HttpModule,
    LogModule,
    UsersModule,
    HealthModule,
    QueueModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
        port: parseInt(`${process.env.REDIS_PORT}`, 10),
      },
    }),
    // NOTE: ASYNC WOULD BE NICE BUT IT JUST TIMES OUT.
    // BullModule.forRootAsync({
    //   useFactory: async (configService: ConfigService) => {
    //     const service = configService.get<RedisConfig>('redis');
    //     if (!service) throw new Error('Config Module is not declared.');
    //     const config: BullRootModuleOptions = {
    //       redis: {
    //         host: service.host,
    //         port: service.port,
    //         username: service.username || 'default',
    //         password: service.password,
    //       },
    //       // defaultJobOptions: {
    //       //   attempts: 6,
    //       // },
    //     };
    //     return config;
    //   },
    //   inject: [ConfigService],
    // }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    CommunicationsModule,
  ],
  controllers: [AppController],
  providers: [CognitoService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
    consumer.apply(SessionParamsMiddleware).forRoutes('*');
  }
}
