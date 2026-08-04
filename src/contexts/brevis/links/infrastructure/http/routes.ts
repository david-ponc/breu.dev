import Elysia from 'elysia';
import z from 'zod';

import { LinkDeleter } from '#/contexts/brevis/links/application/delete/link-deleter';
import { AvailableSlugSuggester } from '#/contexts/brevis/links/application/generate/available-slug-suggester';
import { SlugCompletionSuggester } from '#/contexts/brevis/links/application/generate/slug-completion-suggester';
import { LinkUpserter } from '#/contexts/brevis/links/application/upsert/link-upserter';
import {
	CreateLinkSchema,
	LinkSlugSchema,
	MetaSchema,
} from '#/contexts/brevis/links/domain/link';
import { MetaCollector } from '#/contexts/brevis/links/domain/meta-collector';
import { container } from '#/core/container';
import { authPlugin } from '#/core/lib/auth/plugin';

import { SlugAvailabilityChecker } from '../../application/search-one/slug-availability-checker';
import { errorHandler } from './error-handling';

export const brevisLinksRoutes = new Elysia({ prefix: '/brevis/links' })
	.use(authPlugin)
	.use(errorHandler)
	.get(
		'/availability',
		async ({ query }) => {
			const slugAvailabilityChecker = container.get(SlugAvailabilityChecker);
			const exists = await slugAvailabilityChecker.execute(query.slug);

			return { available: !exists };
		},
		{
			auth: true,
			query: z.object({ slug: LinkSlugSchema }),
			response: { 200: z.object({ available: z.boolean() }) },
		},
	)
	.get(
		'/slugs',
		async () => {
			const suggester = container.get(AvailableSlugSuggester);
			const slug = await suggester.execute();

			return { slug };
		},
		{
			auth: true,
			response: { 200: z.object({ slug: LinkSlugSchema }) },
		},
	)
	.get(
		'/slugs/completion',
		async ({ query }) => {
			const suggester = container.get(SlugCompletionSuggester);

			return suggester.execute(query.url);
		},
		{
			auth: true,
			query: z.object({ url: z.url() }),
			response: {
				200: z.object({
					slug: LinkSlugSchema,
					meta: MetaSchema,
				}),
			},
		},
	)
	.put(
		'/:id',
		async ({ body, params, user }) => {
			const id = params.id;
			const userId = user.id;
			const linkUpserter = container.get(LinkUpserter);
			const meta = await container.get(MetaCollector).collect(body.url);

			return linkUpserter.execute({ ...body, id, userId, meta });
		},
		{ auth: true, body: CreateLinkSchema.omit({ id: true, userId: true }) },
	)
	.delete(
		'/:id',
		async ({ params, user }) => {
			const id = params.id;
			const userId = user.id;
			const linkDeleter = container.get(LinkDeleter);

			return linkDeleter.execute({ id, userId });
		},
		{ auth: true },
	);
