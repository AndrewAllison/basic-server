import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
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
})
export class ConfigModule {}
