import { z } from 'zod';

const envSchema = z
	.object({
		BASE_URL: z.url(),
		DATABASE_URL: z.url(),
		REDIS_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		RESEND_API_KEY: z.string().min(1).optional(),
		RESEND_FROM: z.string().min(1),
		GITHUB_CLIENT_ID: z.string().min(1),
		GITHUB_CLIENT_SECRET: z.string().min(1),
		DISCORD_CLIENT_ID: z.string().min(1),
		DISCORD_CLIENT_SECRET: z.string().min(1),
		AI_GATEWAY_API_KEY: z.string().min(1),
		AI_SLUG_MODEL: z.string().min(1),
		NODE_ENV: z.enum(['development', 'production', 'test']),
	})
	.superRefine(({ NODE_ENV, RESEND_API_KEY }, context) => {
		if (NODE_ENV === 'production' && !RESEND_API_KEY) {
			context.addIssue({
				code: 'custom',
				path: ['RESEND_API_KEY'],
				message: 'RESEND_API_KEY is required in production',
			});
		}
	});

export const serverEnv = envSchema.parse(process.env);

export const IS_DEVELOPMENT = serverEnv.NODE_ENV === 'development';
export const IS_PRODUCTION = serverEnv.NODE_ENV === 'production';
export const IS_TEST = serverEnv.NODE_ENV === 'test';
