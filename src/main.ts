import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvConfig } from './modules/config/models/env.config';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as process from 'process';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { RedisConfig } from './modules/config/models/redis.config';

let port;
let env;
let appUrl;

async function bootstrap() {
  // Currently only using certificates locally
  const httpsOptions =
    process.env.NODE_ENV === 'local'
      ? {
          key: fs.readFileSync('./ssl/key.pem'),
          cert: fs.readFileSync('./ssl/cert.pem'),
        }
      : undefined;

  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.useLogger(app.get(Logger));

  // config & env settings
  const configService = app.get(ConfigService);
  const envConfig = configService.get<EnvConfig>('env');
  const redisConfig = configService.getOrThrow<RedisConfig>('redis');
  port = envConfig?.port || 8080;
  env = envConfig?.env || 'production';

  // Few security tweaks. TODO CORS will need better handling.
  app.enableCors({ credentials: true, origin: 'https://localhost:3000' });
  app.use(helmet());
  app.use(cookieParser());

  const redisUrl = `redis://${redisConfig.username}:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`;
  const redisClient = createClient({
    url: redisUrl,
  });
  redisClient.connect().catch(console.error);

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: `${configService.get('SESSION_SECRET')}`, // Replace with a secure secret key
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    }),
  );

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
