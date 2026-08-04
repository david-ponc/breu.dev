import { Service } from 'diod';
import { friendlyWords } from 'friendlier-words';

import { SlugSuggestionFailedError } from '#/contexts/brevis/links/domain/errors/slug-suggestion-failed';
import { type LinkSlug, LinkSlugSchema } from '#/contexts/brevis/links/domain/link';
import type {
	SlugGenerator,
	SlugGeneratorContext,
} from '#/contexts/brevis/links/domain/slug-generator';
import { logger } from '#/core/lib/logging';

@Service()
export class FriendlyWordsSlugGenerator implements SlugGenerator {
	private readonly MAX_ATTEMPTS = 20;

	async generate(_context?: SlugGeneratorContext): Promise<LinkSlug> {
		logger.debug('Generating slug using friendly words');

		for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
			const result = LinkSlugSchema.safeParse(friendlyWords());

			if (result.success) {
				return result.data;
			}
		}

		throw new SlugSuggestionFailedError();
	}
}
