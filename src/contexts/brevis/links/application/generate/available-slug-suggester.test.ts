import { beforeEach, describe, expect, it } from 'vitest';

import { SlugSuggestionFailedError } from '#/contexts/brevis/links/domain/errors/slug-suggestion-failed';
import {
	type Link,
	LinkSchema,
	type LinkSlug,
} from '#/contexts/brevis/links/domain/link';
import type { SlugGenerator } from '#/contexts/brevis/links/domain/slug-generator';
import { InMemoryLinkRepository } from '#/contexts/brevis/links/infrastructure/in-memory-link-repository';
import { Identifier } from '#/core/lib/identifier';

import { AvailableSlugSuggester } from './available-slug-suggester';

class SequenceSlugGenerator implements SlugGenerator {
	constructor(private readonly slugs: LinkSlug[]) {}

	async generate(): Promise<LinkSlug> {
		const slug = this.slugs.shift();

		if (!slug) {
			throw new Error('No more slugs in sequence');
		}

		return slug;
	}
}

function aLink(overrides?: Partial<Link>): Link {
	const past = new Date(Date.now() - 1000).toISOString();
	return LinkSchema.parse({
		id: Identifier.generate(),
		userId: Identifier.generate(),
		slug: 'my-link',
		url: 'https://example.com',
		comments: null,
		meta: null,
		status: 'active',
		createdAt: past,
		updatedAt: past,
		...overrides,
	});
}

describe('suggesting an available slug', () => {
	let repository: InMemoryLinkRepository;

	beforeEach(() => {
		repository = new InMemoryLinkRepository();
	});

	it('returns the first generated slug when it is free', async () => {
		const suggester = new AvailableSlugSuggester(
			new SequenceSlugGenerator(['free-slug', 'other-slug']),
			repository,
		);

		const slug = await suggester.execute();

		expect(slug).toBe('free-slug');
	});

	it('retries when the generated slug is already taken', async () => {
		await repository.save(aLink({ slug: 'taken-slug' }));
		const suggester = new AvailableSlugSuggester(
			new SequenceSlugGenerator(['taken-slug', 'free-slug']),
			repository,
		);

		const slug = await suggester.execute();

		expect(slug).toBe('free-slug');
	});

	it('fails when every generated slug is taken', async () => {
		const taken = Array.from({ length: 10 }, (_, i) => `slug-${i}`);
		for (const slug of taken) {
			await repository.save(aLink({ slug }));
		}
		const suggester = new AvailableSlugSuggester(
			new SequenceSlugGenerator([...taken, 'never-reached']),
			repository,
		);

		await expect(suggester.execute()).rejects.toThrow(SlugSuggestionFailedError);
	});
});
