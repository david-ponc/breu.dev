import { treaty } from '@elysia/eden';
import { createIsomorphicFn } from '@tanstack/react-start';

import { clientEnv } from '#/config/env/client';

import { type App, app } from './app.server';

export const httpClient = createIsomorphicFn()
	.server(() => treaty(app).api)
	.client(() => treaty<App>(clientEnv.VITE_BASE_URL).api);
