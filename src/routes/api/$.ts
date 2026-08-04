import { treaty } from '@elysia/eden';
import { createFileRoute } from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';
import { Elysia } from 'elysia';

import { clientEnv } from '#/config/env';
import { brevisLinksRoutes } from '#/contexts/brevis/links/infrastructure/http/routes';
import { redirectLinkRoutes } from '#/contexts/redirect/links/infrastructure/http/routes';
import { auth } from '#/core/lib/auth';

const app = new Elysia({ prefix: '/api' })
	.mount(auth.handler)
	.use(brevisLinksRoutes)
	.use(redirectLinkRoutes)
	.get('/', () => 'Hello World!');

const handle = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute('/api/$')({
	server: {
		handlers: {
			GET: handle,
			POST: handle,
			PUT: handle,
			PATCH: handle,
			DELETE: handle,
		},
	},
});

export const getTreaty = createIsomorphicFn()
	.server(() => treaty(app).api)
	.client(() => treaty<typeof app>(clientEnv.VITE_BASE_URL).api);
