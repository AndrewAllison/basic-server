import * as Joi from 'joi';

const validationScheme = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'local')
    .default('local'),
  PORT: Joi.number().default(80),
  DATABASE_URL: Joi.string().required(),
  LOG_LEVEL: Joi.string().default('trace'),
  AUTO_LOGGING: Joi.boolean().default(false),
  SEQ_SERVER_URL: Joi.string().default('http://localhost:5341'),
  SEQ_API_KEY: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_USERNAME: Joi.string().optional(),
  REDIS_PORT: Joi.number().required(),
});

export default validationScheme;
