import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid MySQL database connection URL'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().default('super_secret_refresh_key_campusmarket_2026'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_campusmarket2026'),
  RAZORPAY_KEY_SECRET: z.string().default('test_secret_campusmarket_key_2026'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('test_webhook_secret_2026'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid Environment Variables Configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Environment variables validation failed.');
  }
  return result.data;
}
