import { Service } from 'diod';

import type { PostgresConnection } from '#/contexts/shared/infrastructure/postgres/connection';

import { VisitNotFoundError } from '../domain/errors/visit-not-found';
import type { ParsedUserAgent, Visit, VisitEventId, VisitLinkId } from '../domain/visit';
import { VisitSchema } from '../domain/visit';
import type { VisitRepository } from '../domain/visit-repository';

type VisitRow = {
	id: string;
	event_id: string;
	link_id: string;
	user_id: string;
	ip: string | null;
	country: string | null;
	referer: string | null;
	user_agent_raw: string | null;
	user_agent: ParsedUserAgent | null;
	is_bot: boolean;
	visited_at: string;
};

@Service()
export class PostgresVisitRepository implements VisitRepository {
	constructor(private readonly connection: PostgresConnection) {}

	async save(visit: Visit): Promise<void> {
		const { sql } = this.connection;

		await sql`
			INSERT INTO analytics.visits (
				id,
				event_id,
				link_id,
				user_id,
				ip,
				country,
				referer,
				user_agent_raw,
				user_agent,
				is_bot,
				visited_at
			) VALUES (
				${visit.id},
				${visit.eventId},
				${visit.linkId},
				${visit.userId},
				${visit.ip},
				${visit.country},
				${visit.referer},
				${visit.userAgentRaw},
				${sql.json(visit.userAgent)},
				${visit.isBot},
				${visit.visitedAt}
			)
			ON CONFLICT (event_id) DO NOTHING
		`;
	}

	async existsByEventId(eventId: VisitEventId): Promise<boolean> {
		const { sql } = this.connection;

		const [row] = await sql<{ exists: boolean }[]>`
			SELECT EXISTS(
				SELECT 1
				FROM analytics.visits
				WHERE event_id = ${eventId}
			)
		`;

		return row.exists;
	}

	async findByLinkId(id: VisitLinkId): Promise<Visit> {
		const { sql } = this.connection;

		const [row] = await sql<VisitRow[]>`
			SELECT
				id,
				event_id,
				link_id,
				user_id,
				ip,
				country,
				referer,
				user_agent_raw,
				user_agent,
				is_bot,
				visited_at
			FROM analytics.visits
			WHERE link_id = ${id}
			ORDER BY visited_at DESC
			LIMIT 1
		`;

		if (!row) {
			throw new VisitNotFoundError(id);
		}

		return this.toDomain(row);
	}

	private toDomain(row: VisitRow): Visit {
		return VisitSchema.parse({
			id: row.id,
			eventId: row.event_id,
			linkId: row.link_id,
			userId: row.user_id,
			ip: row.ip,
			country: row.country,
			referer: row.referer,
			userAgentRaw: row.user_agent_raw,
			userAgent: row.user_agent,
			isBot: row.is_bot,
			visitedAt: row.visited_at,
		});
	}
}
