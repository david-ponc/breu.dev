import { Service } from 'diod';

import type { PostgresConnection } from '#/contexts/shared/infrastructure/postgres/connection';
import type { Maybe } from '#/core/types';

import type { Link, LinkSlug, LinkStatus } from '../domain/link';
import { LinkSchema } from '../domain/link';
import type { LinkRepository } from '../domain/link-repository';

type LinkRow = {
	id: string;
	user_id: string;
	slug: string;
	url: string;
	status: LinkStatus;
};

@Service()
export class PostgresLinkRepository implements LinkRepository {
	constructor(private readonly connection: PostgresConnection) {}

	async searchBySlug(slug: LinkSlug): Promise<Maybe<Link>> {
		const { sql } = this.connection;

		const [row] = await sql<LinkRow[]>`
			SELECT
				id,
				user_id,
				slug,
				url,
				status
			FROM redirect.links
			WHERE slug = ${slug}
		`;

		return row ? this.toDomain(row) : null;
	}

	private toDomain(row: LinkRow): Link {
		return LinkSchema.parse({
			id: row.id,
			userId: row.user_id,
			slug: row.slug,
			url: row.url,
			status: row.status,
		});
	}
}
