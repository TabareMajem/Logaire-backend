import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  METRICS_WS_URL: z.string().url(),
  // Add other environment variables
});

export function validateEnvironment() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }
} 