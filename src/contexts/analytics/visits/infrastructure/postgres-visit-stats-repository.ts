import { Service } from 'diod';

import type { PostgresConnection } from '#/contexts/shared/infrastructure/postgres/connection';

import {
	type LinkStats,
	LinkStatsSchema,
	type SearchLinkStatsQuery,
	type SearchRecentVisitsQuery,
	type VisitLogEntry,
	VisitLogEntrySchema,
} from '../domain/link-stats';
import type { ParsedUserAgent } from '../domain/visit';
import type { VisitStatsRepository } from '../domain/visit-stats-repository';

type TotalsRow = {
	lifetimeClicks: number;
	periodClicks: number;
	bots: number;
	lastVisitedAt: string | null;
};

type ActivityRow = { date: string; clicks: number };
type NamedCountRow = { key: string; count: number };
type VisitLogRow = {
	id: string;
	visitedAt: string;
	referer: string | null;
	country: string | null;
	isBot: boolean;
	userAgent: ParsedUserAgent | null;
};

@Service()
export class PostgresVisitStatsRepository implements VisitStatsRepository {
	constructor(private readonly connection: PostgresConnection) {}

	async searchStats(query: SearchLinkStatsQuery): Promise<LinkStats> {
		const [totals, activity, devices, browsers, os, referrers, countries] =
			await Promise.all([
				this.totals(query),
				this.activity(query),
				this.devices(query),
				this.browsers(query),
				this.os(query),
				this.referrers(query),
				this.countries(query),
			]);

		return LinkStatsSchema.parse({
			...totals,
			activity,
			devices,
			browsers,
			os,
			referrers,
			countries,
		});
	}

	async searchRecent(query: SearchRecentVisitsQuery): Promise<VisitLogEntry[]> {
		const { sql } = this.connection;
		const rows = await sql<VisitLogRow[]>`
			SELECT
				id,
				visited_at AS "visitedAt",
				referer,
				country,
				is_bot AS "isBot",
				user_agent AS "userAgent"
			FROM analytics.visits
			WHERE link_id = ${query.linkId} AND user_id = ${query.userId}
			ORDER BY visited_at DESC
			LIMIT ${query.limit}
		`;

		return rows.map((row) => VisitLogEntrySchema.parse(row));
	}

	private async totals(query: SearchLinkStatsQuery): Promise<TotalsRow> {
		const { sql } = this.connection;
		const [row] = await sql<TotalsRow[]>`
			SELECT
				COUNT(*)::float8 AS "lifetimeClicks",
				COUNT(*) FILTER (
					WHERE visited_at >= ${query.since}::timestamptz
						AND visited_at <= ${query.until}::timestamptz
				)::float8 AS "periodClicks",
				COUNT(*) FILTER (
					WHERE is_bot
						AND visited_at >= ${query.since}::timestamptz
						AND visited_at <= ${query.until}::timestamptz
				)::float8 AS "bots",
				MAX(visited_at) AS "lastVisitedAt"
			FROM analytics.visits
			WHERE link_id = ${query.linkId} AND user_id = ${query.userId}
		`;

		return (
			row ?? {
				lifetimeClicks: 0,
				periodClicks: 0,
				bots: 0,
				lastVisitedAt: null,
			}
		);
	}

	private activity(query: SearchLinkStatsQuery): Promise<ActivityRow[]> {
		const { sql } = this.connection;
		return sql<ActivityRow[]>`
			SELECT
				(visited_at AT TIME ZONE 'UTC')::date::text AS date,
				COUNT(*)::float8 AS clicks
			FROM analytics.visits
			WHERE link_id = ${query.linkId}
				AND user_id = ${query.userId}
				AND visited_at >= ${query.since}::timestamptz
				AND visited_at <= ${query.until}::timestamptz
			GROUP BY 1
			ORDER BY 1
		`;
	}

	private devices(query: SearchLinkStatsQuery): Promise<NamedCountRow[]> {
		const { sql } = this.connection;
		return sql<NamedCountRow[]>`
			SELECT
				COALESCE(user_agent->>'deviceType', 'unknown') AS key,
				COUNT(*)::float8 AS count
			FROM analytics.visits
			WHERE link_id = ${query.linkId}
				AND user_id = ${query.userId}
				AND visited_at >= ${query.since}::timestamptz
				AND visited_at <= ${query.until}::timestamptz
			GROUP BY 1
			ORDER BY count DESC, key
		`;
	}

	private browsers(query: SearchLinkStatsQuery): Promise<NamedCountRow[]> {
		const { sql } = this.connection;
		return sql<NamedCountRow[]>`
			SELECT
				COALESCE(user_agent->>'browser', 'Unknown') AS key,
				COUNT(*)::float8 AS count
			FROM analytics.visits
			WHERE link_id = ${query.linkId}
				AND user_id = ${query.userId}
				AND visited_at >= ${query.since}::timestamptz
				AND visited_at <= ${query.until}::timestamptz
			GROUP BY 1
			ORDER BY count DESC, key
		`;
	}

	private os(query: SearchLinkStatsQuery): Promise<NamedCountRow[]> {
		const { sql } = this.connection;
		return sql<NamedCountRow[]>`
			SELECT
				COALESCE(user_agent->>'os', 'Unknown') AS key,
				COUNT(*)::float8 AS count
			FROM analytics.visits
			WHERE link_id = ${query.linkId}
				AND user_id = ${query.userId}
				AND visited_at >= ${query.since}::timestamptz
				AND visited_at <= ${query.until}::timestamptz
			GROUP BY 1
			ORDER BY count DESC, key
		`;
	}

	private referrers(query: SearchLinkStatsQuery): Promise<NamedCountRow[]> {
		const { sql } = this.connection;
		return sql<NamedCountRow[]>`
			SELECT
				CASE
					WHEN referer IS NULL OR btrim(referer) = '' THEN 'Direct'
					ELSE COALESCE(substring(referer FROM '^https?://([^/?#]+)'), referer)
				END AS key,
				COUNT(*)::float8 AS count
			FROM analytics.visits
			WHERE link_id = ${query.linkId}
				AND user_id = ${query.userId}
				AND visited_at >= ${query.since}::timestamptz
				AND visited_at <= ${query.until}::timestamptz
			GROUP BY 1
			ORDER BY count DESC, key
		`;
	}

	private countries(query: SearchLinkStatsQuery): Promise<NamedCountRow[]> {
		const { sql } = this.connection;
		return sql<NamedCountRow[]>`
			SELECT country AS key, COUNT(*)::float8 AS count
			FROM analytics.visits
			WHERE link_id = ${query.linkId}
				AND user_id = ${query.userId}
				AND visited_at >= ${query.since}::timestamptz
				AND visited_at <= ${query.until}::timestamptz
				AND country IS NOT NULL
			GROUP BY 1
			ORDER BY count DESC, key
		`;
	}
}
