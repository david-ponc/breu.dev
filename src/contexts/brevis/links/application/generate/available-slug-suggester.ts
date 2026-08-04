import { Service } from 'diod';

import { SlugSuggestionFailedError } from '#/contexts/brevis/links/domain/errors/slug-suggestion-failed';
import type { LinkSlug } from '#/contexts/brevis/links/domain/link';
import type { LinkRepository } from '#/contexts/brevis/links/domain/link-repository';
import type { SlugGenerator } from '#/contexts/brevis/links/domain/slug-generator';
import { logger } from '#/core/lib/logging';

@Service()
export class AvailableSlugSuggester {
	private readonly MAX_ATTEMPTS = 5;

	constructor(
		private readonly slugGenerator: SlugGenerator,
		private readonly repository: LinkRepository,
	) {}

	async execute(): Promise<LinkSlug> {
		for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
			const slug = await this.slugGenerator.generate();
			const existing = await this.repository.searchBySlug(slug);

			if (!existing) {
				logger.debug({ slug, attempt: attempt + 1 }, 'Available slug suggested');
				return slug;
			}

			logger.debug({ slug, attempt: attempt + 1 }, 'Generated slug already taken');
		}

		throw new SlugSuggestionFailedError();
	}
}
