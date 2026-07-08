import { z } from 'zod';

const envSchema = z.object({
	BASE_URL: z.url(),
	NODE_ENV: z.enum(['development', 'production', 'test']),
});

const clientEnvSchema = z.object({
	VITE_BASE_URL: z.url(),
});

export const serverEnv = envSchema.parse(process.env);

export const clientEnv = clientEnvSchema.parse(import.meta.env);
