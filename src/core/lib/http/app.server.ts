import { Elysia } from 'elysia';

import { analyticsLinksRoutes } from '#/contexts/analytics/visits/infrastructure/http/routes';
import { brevisLinksRoutes } from '#/contexts/brevis/links/infrastructure/http/routes';
import { redirectLinkRoutes } from '#/contexts/redirect/links/infrastructure/http/routes';
import { auth } from '#/core/lib/auth';

export const app = new Elysia({ prefix: '/api' })
	.mount(auth.handler)
	.use(brevisLinksRoutes)
	.use(analyticsLinksRoutes)
	.use(redirectLinkRoutes)
	.get('/', () => 'Hello World!');

export type App = typeof app;
