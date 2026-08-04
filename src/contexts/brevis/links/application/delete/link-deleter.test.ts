import { beforeEach, describe, expect, it } from 'vitest';

import { LinkNotFoundError } from '#/contexts/brevis/links/domain/errors/link-not-found';
import { LinkDeletedEvent } from '#/contexts/brevis/links/domain/events/link-deleted-event';
import {
	type DeleteLinkCommand,
	type Link,
	LinkSchema,
} from '#/contexts/brevis/links/domain/link';
import { InMemoryLinkRepository } from '#/contexts/brevis/links/infrastructure/in-memory-link-repository';
import { InMemoryEventBus } from '#/contexts/shared/infrastructure/in-memory-event-bus';
import { Identifier } from '#/core/lib/identifier';

import { LinkDeleter } from './link-deleter';

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

function aDeleteCommand(overrides?: Partial<DeleteLinkCommand>): DeleteLinkCommand {
	return {
		id: Identifier.generate(),
		userId: Identifier.generate(),
		...overrides,
	};
}

describe('deleting a link', () => {
	let repository: InMemoryLinkRepository;
	let eventBus: InMemoryEventBus;
	let deleter: LinkDeleter;

	beforeEach(() => {
		repository = new InMemoryLinkRepository();
		eventBus = new InMemoryEventBus();
		deleter = new LinkDeleter(repository, eventBus);
	});

	it('deletes the link when it belongs to the requesting user', async () => {
		const userId = Identifier.generate();
		const link = aLink({ userId });
		await repository.save(link);
		const command = aDeleteCommand({ id: link.id, userId });

		await deleter.execute(command);

		await expect(repository.findById(link.id)).rejects.toThrow(LinkNotFoundError);
	});

	it('publishes a link deleted event', async () => {
		const userId = Identifier.generate();
		const link = aLink({ userId });
		await repository.save(link);
		const command = aDeleteCommand({ id: link.id, userId });

		await deleter.execute(command);

		expect(eventBus.publishedEvents).toHaveLength(1);
		expect(eventBus.publishedEvents[0]).toBeInstanceOf(LinkDeletedEvent);
		expect(eventBus.publishedEvents[0]?.payload).toEqual(link);
	});

	it('throws not found when the link does not exist', async () => {
		const command = aDeleteCommand();

		await expect(deleter.execute(command)).rejects.toThrow(LinkNotFoundError);
	});

	it('throws not found when the link belongs to another user', async () => {
		const link = aLink({ userId: Identifier.generate() });
		await repository.save(link);
		const command = aDeleteCommand({ id: link.id, userId: Identifier.generate() });

		await expect(deleter.execute(command)).rejects.toThrow(LinkNotFoundError);
	});

	it('does not delete or publish when the link belongs to another user', async () => {
		const link = aLink({ userId: Identifier.generate() });
		await repository.save(link);
		const command = aDeleteCommand({ id: link.id, userId: Identifier.generate() });

		await expect(deleter.execute(command)).rejects.toThrow(LinkNotFoundError);

		expect(eventBus.publishedEvents).toHaveLength(0);
		const saved = await repository.findById(link.id);
		expect(saved).toEqual(link);
	});
});
