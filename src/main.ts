import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvConfig } from './modules/config/models/env.config';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Few security tweaks. TODO CORS will need better handling.
  app.enableCors();
  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Basic Server')
    .setDescription('Some documentation for the basic server')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableVersioning({
    type: VersioningType.URI,
  });

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
