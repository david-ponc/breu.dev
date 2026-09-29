import { beforeEach, describe, expect, it } from 'vitest';

import { LinkNotFoundError } from '#/contexts/brevis/links/domain/errors/link-not-found';
import { type Link, LinkSchema } from '#/contexts/brevis/links/domain/link';
import { InMemoryLinkRepository } from '#/contexts/brevis/links/infrastructure/in-memory-link-repository';
import { Identifier } from '#/core/lib/identifier';

import { UserLinkFinder } from './user-link-finder';

function aLink(overrides?: Partial<Link>): Link {
	const past = new Date(Date.now() - 1000).toISOString();
	return LinkSchema.parse({
		id: Identifier.generate(),
		userId: Identifier.generate(),
		slug: 'my-link',
		url: 'https://example.com',
		comments: 'internal note',
		meta: null,
		status: 'active',
		createdAt: past,
		updatedAt: past,
		...overrides,
	});
}

describe('finding a user link', () => {
	let repository: InMemoryLinkRepository;
	let finder: UserLinkFinder;

	beforeEach(() => {
		repository = new InMemoryLinkRepository();
		finder = new UserLinkFinder(repository);
	});

	it('returns the link when it belongs to the requesting user', async () => {
		const userId = Identifier.generate();
		const link = aLink({ userId });
		await repository.save(link);

		await expect(finder.execute(link.id, userId)).resolves.toEqual(link);
	});

	it('throws not found when the link does not exist', async () => {
		await expect(
			finder.execute(Identifier.generate(), Identifier.generate()),
		).rejects.toThrow(LinkNotFoundError);
	});

	it('throws not found when the link belongs to another user', async () => {
		const link = aLink({ userId: Identifier.generate() });
		await repository.save(link);

		await expect(finder.execute(link.id, Identifier.generate())).rejects.toThrow(
			LinkNotFoundError,
		);
	});
});
