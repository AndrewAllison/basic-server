import * as Joi from 'joi';

const validationScheme = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'local')
    .default('local'),
  PORT: Joi.number().default(80),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_AUDIENCE: Joi.string().required(),
  JWT_ISSUER: Joi.string().required(),
  LOG_LEVEL: Joi.string().default('trace'),
  AUTO_LOGGING: Joi.boolean().default(false),
  SEQ_SERVER_URL: Joi.string().default('http://localhost:5341'),
  SEQ_API_KEY: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_USERNAME: Joi.string().optional(),
  REDIS_PORT: Joi.number().required(),
  EMAIL_SERVER_HOST: Joi.string().required(),
  EMAIL_SERVER_PORT: Joi.number().required(),
  EMAIL_SERVER_USER: Joi.string().required(),
  EMAIL_SERVER_PASSWORD: Joi.string().required(),
  EMAIL_FROM: Joi.string().required(),
  EMAIL_FROM_NAME: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_COGNITO_CLIENT_ID: Joi.string().required(),
  AWS_COGNITO_USER_POOL_ID: Joi.string().required(),
});

export default validationScheme;
