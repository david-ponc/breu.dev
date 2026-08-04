import { describe, expect, it } from 'vitest';

import { LinkSlugSchema } from '#/contexts/brevis/links/domain/link';

import { FriendlyWordsSlugGenerator } from './friendly-words-slug-generator';

describe('FriendlyWordsSlugGenerator', () => {
	it('always returns a slug that satisfies LinkSlugSchema', async () => {
		const generator = new FriendlyWordsSlugGenerator();

		for (let i = 0; i < 50; i++) {
			const slug = await generator.generate();
			expect(() => LinkSlugSchema.parse(slug)).not.toThrow();
			expect(slug.length).toBeGreaterThanOrEqual(3);
			expect(slug.length).toBeLessThanOrEqual(18);
		}
	});
});
