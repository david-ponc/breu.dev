import { Service } from 'diod';

import type { PostgresConnection } from '#/contexts/shared/infrastructure/postgres/connection';

import { type LinkSummary, LinkSummarySchema } from '../domain/link-summary';
import type { LinkSummaryRepository } from '../domain/link-summary-repository';

@Service()
export class PostgresLinkSummaryRepository implements LinkSummaryRepository {
	constructor(private readonly connection: PostgresConnection) {}

	async searchByUserId(
		userId: string,
		since: string,
		until: string,
	): Promise<LinkSummary[]> {
		const { sql } = this.connection;
		const rows = await sql<LinkSummary[]>`
			SELECT link.id, link.slug, link.url, link.status,
				link.created_at AS "createdAt",
				COALESCE(stats.total, 0)::float8 AS "totalClicks",
				COALESCE(stats.activity, '[]'::jsonb) AS activity
			FROM brevis.links AS link
			LEFT JOIN LATERAL (
				SELECT SUM(daily.clicks) AS total,
					jsonb_agg(
						jsonb_build_object('date', daily.day, 'clicks', daily.clicks)
						ORDER BY daily.day
					) FILTER (WHERE daily.day >= (${since}::timestamptz AT TIME ZONE 'UTC')::date) AS activity
				FROM (
					SELECT (visited_at AT TIME ZONE 'UTC')::date AS day, COUNT(*) AS clicks
					FROM analytics.visits
					WHERE link_id = link.id AND user_id = ${userId}
						AND visited_at <= ${until}::timestamptz
					GROUP BY (visited_at AT TIME ZONE 'UTC')::date
				) AS daily
			) AS stats ON true
			WHERE link.user_id = ${userId}
			ORDER BY link.created_at DESC, link.id DESC
		`;
		return rows.map((row) => LinkSummarySchema.parse(row));
	}
}
