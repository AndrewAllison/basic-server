import { PinoLogger } from 'nestjs-pino';
import { createStream } from 'pino-seq';

const getPinoLogger = (name: string, level = 'trace') => {
  const seqStream = createStream({
    serverUrl: process.env.SEQ_SERVER_URL,
    apiKey: process.env.SEQ_API_KEY,
    logOtherAs: 'Verbose',
  });

  return new PinoLogger({
    pinoHttp: [{ level: level, name: name }, seqStream],
  });
};

export { getPinoLogger };
