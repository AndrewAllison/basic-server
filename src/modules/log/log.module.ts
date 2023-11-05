import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { LogService, RequestLogService } from './log.service';
import { CorrelationService } from './correlation/correlation.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino/file',
          options: { destination: './logs/logs.log', mkdir: true },
        },
      },
    }),
    // TODO: SEQ - This is a cool way of logging
    //  with SEQ but as it's a pain getting a
    //  SEQ box up and running I've let it
    // LoggerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (config: ConfigService) => {
    //     // const logConfig = config.get<LogConfig>('logging');
    //     // const seqStream = createStream({
    //     //   serverUrl: logConfig?.seqServerUrl,
    //     //   apiKey: logConfig?.seqApiKey,
    //     //   logOtherAs: 'Verbose',
    //     // });
    //     return {
    //       pinoHttp: {
    //         transport: 'pino-pretty',
    //       },
    //       // pinoHttp: [
    //       //   {
    //       //     level: logConfig?.level,
    //       //     autoLogging: false,
    //       //   },
    //       //   // seqStream,
    //       // ],
    //     };
    //   },
    // }),
  ],
  providers: [LogService, RequestLogService, CorrelationService],
  exports: [LogService, RequestLogService, CorrelationService],
})
export class LogModule {}
