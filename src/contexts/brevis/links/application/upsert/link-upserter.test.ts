import { beforeEach, describe, expect, it } from 'vitest';

import { AnonymousActionForbiddenError } from '#/contexts/brevis/links/domain/errors/anonymous-action-forbidden';
import { LinkSlugUnavailableError } from '#/contexts/brevis/links/domain/errors/link-slug-unavailable';
import { LinkCreatedEvent } from '#/contexts/brevis/links/domain/events/link-created-event';
import { LinkUpdatedEvent } from '#/contexts/brevis/links/domain/events/link-updated-event';
import {
	type Link,
	LinkSchema,
	type UpsertLinkCommand,
} from '#/contexts/brevis/links/domain/link';
import { InMemoryLinkRepository } from '#/contexts/brevis/links/infrastructure/in-memory-link-repository';
import { InMemoryEventBus } from '#/contexts/shared/infrastructure/in-memory-event-bus';
import { Identifier } from '#/core/lib/identifier';

import { LinkUpserter } from './link-upserter';

function aLinkCommand(overrides?: Partial<UpsertLinkCommand>): UpsertLinkCommand {
	return {
		id: Identifier.generate(),
		userId: Identifier.generate(),
		slug: 'my-link',
		url: 'https://example.com',
		comments: null,
		meta: null,
		...overrides,
	};
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

describe('upserting a link', () => {
	let repository: InMemoryLinkRepository;
	let eventBus: InMemoryEventBus;
	let upserter: LinkUpserter;

	beforeEach(() => {
		repository = new InMemoryLinkRepository();
		eventBus = new InMemoryEventBus();
		upserter = new LinkUpserter(repository, eventBus);
	});

	it('creates a new link when the slug does not exist', async () => {
		const command = aLinkCommand();

		const link = await upserter.execute(command);

		expect(link.slug).toBe(command.slug);
		expect(link.url).toBe(command.url);
		expect(link.status).toBe('active');
		const saved = await repository.searchBySlug(command.slug);
		expect(saved).toBeDefined();
		expect(saved?.id).toBe(link.id);
	});

	it('publishes a link created event when creating a new link', async () => {
		const command = aLinkCommand();

		await upserter.execute(command);

		expect(eventBus.publishedEvents).toHaveLength(1);
		expect(eventBus.publishedEvents[0]).toBeInstanceOf(LinkCreatedEvent);
	});

	it('updates an existing link when the slug belongs to the same user', async () => {
		const userId = Identifier.generate();
		const existing = aLink({ userId });
		await repository.save(existing);
		const command = aLinkCommand({
			slug: existing.slug,
			userId,
			url: 'https://updated.com',
		});

		const link = await upserter.execute(command);

		expect(link.url).toBe('https://updated.com');
		expect(link.createdAt).toBe(existing.createdAt);
		expect(link.updatedAt).not.toBe(existing.updatedAt);
	});

	it('publishes a link updated event when updating an existing link', async () => {
		const userId = Identifier.generate();
		const existing = aLink({ userId });
		await repository.save(existing);
		const command = aLinkCommand({ slug: existing.slug, userId });

		await upserter.execute(command);

		expect(eventBus.publishedEvents).toHaveLength(1);
		expect(eventBus.publishedEvents[0]).toBeInstanceOf(LinkUpdatedEvent);
	});

	it('rejects the operation when the slug belongs to another user', async () => {
		const existing = aLink({ userId: Identifier.generate() });
		await repository.save(existing);
		const command = aLinkCommand({ slug: existing.slug, userId: Identifier.generate() });

		await expect(upserter.execute(command)).rejects.toThrow(LinkSlugUnavailableError);
	});

	it('does not save or publish when the slug belongs to another user', async () => {
		const existing = aLink({ userId: Identifier.generate() });
		await repository.save(existing);
		const command = aLinkCommand({ slug: existing.slug, userId: Identifier.generate() });

		await expect(upserter.execute(command)).rejects.toThrow();

		expect(eventBus.publishedEvents).toHaveLength(0);
		const saved = await repository.searchBySlug(existing.slug);
		expect(saved?.url).toBe(existing.url);
	});

	it('creates the link as active even when a status is provided', async () => {
		const command = aLinkCommand({ status: 'disabled' });

		const link = await upserter.execute(command);

		expect(link.status).toBe('active');
	});

	it('updates the status when the command includes it', async () => {
		const userId = Identifier.generate();
		const existing = aLink({ userId, status: 'active' });
		await repository.save(existing);
		const command = aLinkCommand({
			slug: existing.slug,
			userId,
			status: 'disabled',
		});

		const link = await upserter.execute(command);

		expect(link.status).toBe('disabled');
	});

	it('preserves the status when the command omits it', async () => {
		const userId = Identifier.generate();
		const existing = aLink({ userId, status: 'disabled' });
		await repository.save(existing);
		const command = aLinkCommand({
			slug: existing.slug,
			userId,
			url: 'https://updated.com',
		});

		const link = await upserter.execute(command);

		expect(link.status).toBe('disabled');
		expect(link.url).toBe('https://updated.com');
	});

	it('lets an anonymous user create their first link', async () => {
		const command = aLinkCommand({ isAnonymous: true });

		const link = await upserter.execute(command);

		expect(link.slug).toBe(command.slug);
	});

	it('rejects an anonymous user creating a second link', async () => {
		const userId = Identifier.generate();
		await upserter.execute(aLinkCommand({ userId, isAnonymous: true }));

		await expect(
			upserter.execute(aLinkCommand({ userId, slug: 'second-link', isAnonymous: true })),
		).rejects.toThrow(AnonymousActionForbiddenError);
	});

	it('rejects an anonymous user editing an existing link', async () => {
		const userId = Identifier.generate();
		const existing = aLink({ userId });
		await repository.save(existing);
		const command = aLinkCommand({
			slug: existing.slug,
			userId,
			isAnonymous: true,
			url: 'https://updated.com',
		});

		await expect(upserter.execute(command)).rejects.toThrow(
			AnonymousActionForbiddenError,
		);
	});
});
