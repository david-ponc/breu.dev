import { beforeEach, describe, expect, it } from 'vitest';

import { SlugSuggestionFailedError } from '#/contexts/brevis/links/domain/errors/slug-suggestion-failed';
import {
	type Link,
	LinkSchema,
	type LinkSlug,
	type Meta,
} from '#/contexts/brevis/links/domain/link';
import type { MetaCollector } from '#/contexts/brevis/links/domain/meta-collector';
import type {
	SlugGenerator,
	SlugGeneratorContext,
} from '#/contexts/brevis/links/domain/slug-generator';
import { InMemoryLinkRepository } from '#/contexts/brevis/links/infrastructure/in-memory-link-repository';
import { Identifier } from '#/core/lib/identifier';

import { SlugCompletionSuggester } from './slug-completion-suggester';

const SAMPLE_META: Meta = {
	author: 'Ada',
	favicon: 'https://example.com/favicon.ico',
	title: 'Hello World',
	description: 'A greeting page',
	openGraph: {
		title: 'Hello World',
		description: 'A greeting page',
		image: 'https://example.com/og.png',
	},
};

class FixedMetaCollector implements MetaCollector {
	constructor(private readonly meta: Meta) {}

	async collect(): Promise<Meta> {
		return this.meta;
	}
}

class SequenceSlugGenerator implements SlugGenerator {
	readonly contextHistory: SlugGeneratorContext[] = [];

	constructor(private readonly slugs: LinkSlug[]) {}

	async generate(context: SlugGeneratorContext = {}): Promise<LinkSlug> {
		this.contextHistory.push({
			meta: context.meta,
			rejected: [...(context.rejected ?? [])],
		});
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

describe('suggesting a slug completion from a URL', () => {
	let repository: InMemoryLinkRepository;

	beforeEach(() => {
		repository = new InMemoryLinkRepository();
	});

	it('returns the first free AI slug together with collected meta', async () => {
		const generator = new SequenceSlugGenerator(['hello-world', 'other-slug']);
		const suggester = new SlugCompletionSuggester(
			new FixedMetaCollector(SAMPLE_META),
			generator,
			repository,
		);

		const result = await suggester.execute('https://example.com/hello');

		expect(result).toEqual({ slug: 'hello-world', meta: SAMPLE_META });
		expect(generator.contextHistory[0]?.meta).toEqual(SAMPLE_META);
	});

	it('retries with rejected slugs when the generated slug is taken', async () => {
		await repository.save(aLink({ slug: 'hello-world' }));
		const generator = new SequenceSlugGenerator(['hello-world', 'hello-page']);
		const suggester = new SlugCompletionSuggester(
			new FixedMetaCollector(SAMPLE_META),
			generator,
			repository,
		);

		const result = await suggester.execute('https://example.com/hello');

		expect(result.slug).toBe('hello-page');
		expect(generator.contextHistory[0]?.rejected).toEqual([]);
		expect(generator.contextHistory[1]?.rejected).toEqual(['hello-world']);
	});

	it('fails when every generated slug is taken', async () => {
		const taken = Array.from({ length: 5 }, (_, i) => `slug-${i}` as LinkSlug);
		for (const slug of taken) {
			await repository.save(aLink({ slug }));
		}
		const suggester = new SlugCompletionSuggester(
			new FixedMetaCollector(SAMPLE_META),
			new SequenceSlugGenerator([...taken, 'never-reached']),
			repository,
		);

		await expect(suggester.execute('https://example.com')).rejects.toThrow(
			SlugSuggestionFailedError,
		);
	});
});
