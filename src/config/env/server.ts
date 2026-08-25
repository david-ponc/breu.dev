import { z } from 'zod';

const envSchema = z.object({
	BASE_URL: z.url(),
	DATABASE_URL: z.url(),
	REDIS_URL: z.string().min(1),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.url(),
	GITHUB_CLIENT_ID: z.string().min(1),
	GITHUB_CLIENT_SECRET: z.string().min(1),
	AI_GATEWAY_API_KEY: z.string().min(1),
	AI_SLUG_MODEL: z.string().default('openai/gpt-4.1-mini'),
	NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const serverEnv = envSchema.parse(process.env);

export const IS_DEVELOPMENT = serverEnv.NODE_ENV === 'development';
export const IS_PRODUCTION = serverEnv.NODE_ENV === 'production';
export const IS_TEST = serverEnv.NODE_ENV === 'test';
