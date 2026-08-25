import { z } from 'zod';

const clientEnvSchema = z.object({
	VITE_BASE_URL: z.url(),
});

export const clientEnv = clientEnvSchema.parse(import.meta.env);
