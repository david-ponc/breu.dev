import { Service } from 'diod';

import type { Maybe } from '#/core/types';

import type { Link, LinkSlug } from '../domain/link';
import type { LinkRepository } from '../domain/link-repository';

@Service()
export class InMemoryLinkRepository implements LinkRepository {
	private storageBySlug: Map<LinkSlug, Link> = new Map();

	async save(link: Link): Promise<void> {
		this.storageBySlug.set(link.slug, link);
	}

	async searchBySlug(slug: LinkSlug): Promise<Maybe<Link>> {
		return this.storageBySlug.get(slug) ?? null;
	}
}
