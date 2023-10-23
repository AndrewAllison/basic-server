import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvConfig } from './modules/config/models/env.config';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

let port;
let env;
let appUrl;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));

  // config & env settings
  const configService = app.get(ConfigService);
  const envConfig = configService.get<EnvConfig>('env');
  port = envConfig?.port || 8080;
  env = envConfig?.env || 'production';

  await app.listen(port);
  appUrl = await app.getUrl();
}
bootstrap()
  .catch((e) => {
    console.error(e);
  })
  .then(() => {
    const startUpMessage = `[${env}] - Server Running ${appUrl}`;
    console.log(startUpMessage);
  });
