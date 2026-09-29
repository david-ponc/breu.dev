import { Service } from 'diod';

import { LinkNotFoundError } from '#/contexts/brevis/links/domain/errors/link-not-found';
import type { Link, LinkId } from '#/contexts/brevis/links/domain/link';
import type { LinkRepository } from '#/contexts/brevis/links/domain/link-repository';
import { logger } from '#/core/lib/logging';

@Service()
export class UserLinkFinder {
	constructor(private readonly repository: LinkRepository) {}

	async execute(id: LinkId, userId: string): Promise<Link> {
		const link = await this.repository.findById(id);

		if (link.userId !== userId) {
			logger.warn({ id, userId }, 'Attempted to read a link owned by another user');
			throw new LinkNotFoundError(id);
		}

		return link;
	}
}
