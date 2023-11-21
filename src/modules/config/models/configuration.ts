import * as process from 'process';

export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  env: {
    version: process.env.npm_package_version,
    env: process.env.NODE_ENV,
    port: parseInt(process?.env?.PORT || '0', 10),
  },
  email: {
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10),
    user: process.env.EMAIL_SERVER_USER,
    password: process.env.EMAIL_SERVER_PASSWORD,
    fromAddress: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME,
  },
  logging: {
    level: process.env.LOG_LEVEL,
    autoLogging: process.env.AUTO_LOGGING,
    seqServerUrl: process.env.SEQ_SERVER_URL,
    seqApiKey: process.env.SEQ_API_KEY,
  },
  redis: {
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME ?? undefined,
    password: process.env.REDIS_PASSWORD,
    port: parseInt(`${process.env.REDIS_POST || 6357}`, 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
  },
});
