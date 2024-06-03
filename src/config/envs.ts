import 'dotenv/config';
import * as joi from 'joi';

interface envConfig {
  PORT: number;
  NATS_SERVER: string[];
  JWT_SECRET_KEY: string;
  JWT_EXPIRES_IN: string;
}

const envsSchema: joi.ObjectSchema = joi
  .object({
    PORT: joi.number().default(3004),
    NATS_SERVER: joi.array().items(joi.string()).required(),
    JWT_SECRET_KEY: joi.string().required(),
    JWT_EXPIRES_IN: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVER: process.env.NATS_SERVER?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envConfig: envConfig = value;

export const envs = {
  port: envConfig.PORT,
  natsServer: envConfig.NATS_SERVER,
  jwtSecretKey: envConfig.JWT_SECRET_KEY,
  jwtExpiresIn: envConfig.JWT_EXPIRES_IN,
};
