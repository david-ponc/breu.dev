import Elysia from 'elysia';
import z from 'zod';

import { LinkVisitLister } from '#/contexts/analytics/visits/application/list/link-visit-lister';
import { LinkStatsFinder } from '#/contexts/analytics/visits/application/search/link-stats-finder';
import {
	LinkStatsSchema,
	VisitLogEntrySchema,
} from '#/contexts/analytics/visits/domain/link-stats';
import { VisitSchema } from '#/contexts/analytics/visits/domain/visit';
import { container } from '#/core/container';
import { authPlugin } from '#/core/lib/auth/plugin';

const LinkIdParamsSchema = z.object({ id: VisitSchema.shape.linkId });
const StatsQuerySchema = z.object({
	since: z.iso.datetime(),
	until: z.iso.datetime(),
});
const VisitsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const analyticsLinksRoutes = new Elysia({ prefix: '/analytics/links' })
	.use(authPlugin)
	.get(
		'/:id/visits',
		({ params, query, user }) =>
			container.get(LinkVisitLister).execute({
				linkId: params.id,
				userId: user.id,
				limit: query.limit,
			}),
		{
			auth: true,
			params: LinkIdParamsSchema,
			query: VisitsQuerySchema,
			response: { 200: z.array(VisitLogEntrySchema) },
		},
	)
	.get(
		'/:id',
		({ params, query, user }) =>
			container.get(LinkStatsFinder).execute({
				linkId: params.id,
				userId: user.id,
				since: query.since,
				until: query.until,
			}),
		{
			auth: true,
			params: LinkIdParamsSchema,
			query: StatsQuerySchema,
			response: { 200: LinkStatsSchema },
		},
	);
