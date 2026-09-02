import Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  ANOMALY_CONTINUOUS_FLOW_MINUTES: Joi.number().positive().default(15),
  ANOMALY_CONTINUOUS_FLOW_THRESHOLD: Joi.number().min(0).default(0.05),
  ANOMALY_SPIKE_MULTIPLIER: Joi.number().greater(1).default(3),
  ANOMALY_COOLDOWN_MINUTES: Joi.number().positive().default(60),
  SENSOR_OFFLINE_MINUTES: Joi.number().positive().default(15),
});
