import { Service } from 'diod';

import type { Link, LinkSlug } from '#/contexts/redirect/links/domain/link';
import type { Maybe } from '#/core/types';

@Service()
export abstract class LinkRepository {
	abstract searchBySlug(slug: LinkSlug): Promise<Maybe<Link>>;
}
