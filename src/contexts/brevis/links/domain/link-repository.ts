import { Service } from 'diod';

import type { Maybe } from '#/core/types';

import type { Link, LinkId, LinkSlug } from './link';

@Service()
export abstract class LinkRepository {
	abstract save(link: Link): Promise<void>;
	abstract searchBySlug(slug: LinkSlug): Promise<Maybe<Link>>;
	abstract findById(id: LinkId): Promise<Link>;
	abstract delete(id: LinkId): Promise<void>;
}
