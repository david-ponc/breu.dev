import { Service } from 'diod';

import type { PostgresConnection } from '#/contexts/shared/infrastructure/postgres/connection';
import type { Maybe } from '#/core/types';

import { LinkNotFoundError } from '../domain/errors/link-not-found';
import type { Link, LinkId, LinkSlug, LinkStatus, Meta } from '../domain/link';
import { LinkSchema } from '../domain/link';
import type { LinkRepository } from '../domain/link-repository';

type LinkRow = {
	id: string;
	user_id: string;
	slug: string;
	url: string;
	comments: string | null;
	meta: Meta | null;
	status: LinkStatus;
	created_at: string;
	updated_at: string;
};

@Service()
export class PostgresLinkRepository implements LinkRepository {
	constructor(private readonly connection: PostgresConnection) {}

	async save(link: Link): Promise<void> {
		const { sql } = this.connection;

		await sql`
			INSERT INTO brevis.links (
				id,
				user_id,
				slug,
				url,
				comments,
				meta,
				status,
				created_at,
				updated_at
			) VALUES (
				${link.id},
				${link.userId},
				${link.slug},
				${link.url},
				${link.comments},
				${sql.json(link.meta)},
				${link.status},
				${link.createdAt},
				${link.updatedAt}
			)
			ON CONFLICT (id) DO UPDATE SET
				slug = EXCLUDED.slug,
				url = EXCLUDED.url,
				comments = EXCLUDED.comments,
				meta = EXCLUDED.meta,
				status = EXCLUDED.status,
				updated_at = EXCLUDED.updated_at
		`;
	}

	async searchBySlug(slug: LinkSlug): Promise<Maybe<Link>> {
		const { sql } = this.connection;

		const [row] = await sql<LinkRow[]>`
			SELECT
				id,
				user_id,
				slug,
				url,
				comments,
				meta,
				status,
				created_at,
				updated_at
			FROM brevis.links
			WHERE slug = ${slug}
		`;

		return row ? this.toDomain(row) : null;
	}

	async findById(id: LinkId): Promise<Link> {
		const { sql } = this.connection;

		const [row] = await sql<LinkRow[]>`
			SELECT
				id,
				user_id,
				slug,
				url,
				comments,
				meta,
				status,
				created_at,
				updated_at
			FROM brevis.links
			WHERE id = ${id}
		`;

		if (!row) {
			throw new LinkNotFoundError(id);
		}

		return this.toDomain(row);
	}

	async delete(id: LinkId): Promise<void> {
		const { sql } = this.connection;

		const [row] = await sql<{ id: string }[]>`
			DELETE FROM brevis.links
			WHERE id = ${id}
			RETURNING id
		`;

		if (!row) {
			throw new LinkNotFoundError(id);
		}
	}

	private toDomain(row: LinkRow): Link {
		return LinkSchema.parse({
			id: row.id,
			userId: row.user_id,
			slug: row.slug,
			url: row.url,
			comments: row.comments,
			meta: row.meta,
			status: row.status,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}
}
