import { anonymousClient, magicLinkClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { clientEnv } from '#/config/env/client';

export const authClient = createAuthClient({
	baseURL: clientEnv.VITE_BASE_URL,
	plugins: [anonymousClient(), magicLinkClient()],
});
