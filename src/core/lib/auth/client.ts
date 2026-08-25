import { createAuthClient } from 'better-auth/react';

import { clientEnv } from '#/config/env/client';

export const authClient = createAuthClient({
	baseURL: clientEnv.VITE_BASE_URL,
});
