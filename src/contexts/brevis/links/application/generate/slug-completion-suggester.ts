import { Service } from 'diod';

import { AnonymousActionForbiddenError } from '#/contexts/brevis/links/domain/errors/anonymous-action-forbidden';
import { SlugSuggestionFailedError } from '#/contexts/brevis/links/domain/errors/slug-suggestion-failed';
import type { LinkSlug, Meta } from '#/contexts/brevis/links/domain/link';
import type { LinkRepository } from '#/contexts/brevis/links/domain/link-repository';
import type { MetaCollector } from '#/contexts/brevis/links/domain/meta-collector';
import type { SlugGenerator } from '#/contexts/brevis/links/domain/slug-generator';
import { logger } from '#/core/lib/logging';

export type SlugCompletionResult = {
	slug: LinkSlug;
	meta: Meta;
};

export type SlugCompletionCommand = {
	url: string;
	isAnonymous: boolean;
};

@Service()
export class SlugCompletionSuggester {
	private readonly MAX_ATTEMPTS = 5;

	constructor(
		private readonly metaCollector: MetaCollector,
		private readonly slugGenerator: SlugGenerator,
		private readonly repository: LinkRepository,
	) {}

	async execute({
		url,
		isAnonymous,
	}: SlugCompletionCommand): Promise<SlugCompletionResult> {
		if (isAnonymous) throw new AnonymousActionForbiddenError();

		const meta = await this.metaCollector.collect(url);
		const rejected: LinkSlug[] = [];

		for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
			const slug = await this.slugGenerator.generate({ meta, rejected });
			const existing = await this.repository.searchBySlug(slug);

			if (!existing) {
				logger.debug({ slug, attempt: attempt + 1 }, 'AI slug completion suggested');
				return { slug, meta };
			}

			logger.debug({ slug, attempt: attempt + 1 }, 'AI generated slug already taken');
			rejected.push(slug);
		}

		throw new SlugSuggestionFailedError();
	}
}
