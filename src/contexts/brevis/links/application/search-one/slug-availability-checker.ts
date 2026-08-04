import { Service } from 'diod';

import type { LinkSlug } from '#/contexts/brevis/links/domain/link';
import type { LinkRepository } from '#/contexts/brevis/links/domain/link-repository';
import { logger } from '#/core/lib/logging';

@Service()
export class SlugAvailabilityChecker {
	constructor(private readonly repository: LinkRepository) {}

	async execute(slug: LinkSlug): Promise<boolean> {
		logger.debug({ slug }, 'Checking slug availability');
		const link = await this.repository.searchBySlug(slug);

		return link !== null;
	}
}
