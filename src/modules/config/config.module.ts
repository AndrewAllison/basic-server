import { Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import validationScheme from './scheme';
import configuration from './models/configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration],
      validationSchema: validationScheme,
      isGlobal: true,
      validationOptions: {
        abortEarly: true,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService, ConfigModule],
})
export class ConfigModule {}
