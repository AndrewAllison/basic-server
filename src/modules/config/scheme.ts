import * as Joi from 'joi';

const validationScheme = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'local')
    .default('local'),
  PORT: Joi.number().default(80),
  DATABASE_URL: Joi.string().required(),
});

export default validationScheme;
