import type { Maybe } from '#/core/types';

import { LinkNotFoundError } from '../domain/errors/link-not-found';
import type { Link, LinkId, LinkSlug } from '../domain/link';
import type { LinkRepository } from '../domain/link-repository';

export class InMemoryLinkRepository implements LinkRepository {
	private storageBySlug: Map<LinkSlug, Link> = new Map();
	private storageById: Map<LinkId, Link> = new Map();

	async save(link: Link): Promise<void> {
		this.storageBySlug.set(link.slug, link);
		this.storageById.set(link.id, link);
	}

	async searchBySlug(slug: LinkSlug): Promise<Maybe<Link>> {
		return this.storageBySlug.get(slug) ?? null;
	}

	async findById(id: LinkId): Promise<Link> {
		const link = this.storageById.get(id);

		if (!link) {
			throw new LinkNotFoundError(id);
		}

		return link;
	}

	async delete(id: LinkId): Promise<void> {
		const link = await this.findById(id);

		this.storageById.delete(link.id);
		this.storageBySlug.delete(link.slug);
	}
}
