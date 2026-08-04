import Elysia from 'elysia';
import z from 'zod';

import { LinkResolver } from '#/contexts/redirect/links/application/resolve/link-resolver';
import { LinkSlugSchema } from '#/contexts/redirect/links/domain/link';
import { container } from '#/core/container';

import { errorHandler } from './error-handling';
import { visitorPlugin } from './visitor-plugin';

export const redirectLinkRoutes = new Elysia({ prefix: '/redirect/links' })
	.use(visitorPlugin)
	.use(errorHandler)
	.get(
		'/:slug',
		async ({ params, redirect, visitor }) => {
			const resolver = container.get(LinkResolver);
			const link = await resolver.execute({ slug: params.slug, visitor });

			return redirect(link.url);
		},
		{
			params: z.object({ slug: LinkSlugSchema }),
		},
	);
