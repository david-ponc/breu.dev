import { describe, expect, it } from 'vitest';

import { Identifier } from '#/core/lib/identifier';

import { LinkCreatedEvent } from './events/link-created-event';
import { LinkDeletedEvent } from './events/link-deleted-event';
import { LinkUpdatedEvent } from './events/link-updated-event';
import {
	type CreateLinkCommand,
	createLink,
	type Link,
	LinkSchema,
	updateLink,
} from './link';

function aLinkCommand(overrides?: Partial<CreateLinkCommand>): CreateLinkCommand {
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

describe('creating a link', () => {
	it('starts as active with matching creation and update timestamps', () => {
		const [link] = createLink(aLinkCommand());

		expect(link.status).toBe('active');
		expect(link.createdAt).toBe(link.updatedAt);
	});

	it('raises a link created event containing the full link state', () => {
		const [link, event] = createLink(aLinkCommand());

		expect(event).toBeInstanceOf(LinkCreatedEvent);
		expect(event.payload).toEqual(link);
	});

	it('rejects a slug shorter than 3 characters', () => {
		expect(() => createLink(aLinkCommand({ slug: 'ab' }))).toThrow();
	});

	it('rejects a slug longer than 18 characters', () => {
		expect(() => createLink(aLinkCommand({ slug: 'a'.repeat(19) }))).toThrow();
	});

	it('rejects an invalid URL', () => {
		expect(() => createLink(aLinkCommand({ url: 'not-a-url' }))).toThrow();
	});

	it('rejects an identifier that is not a valid UUID v7', () => {
		expect(() => createLink(aLinkCommand({ id: 'not-a-uuid' }))).toThrow();
	});
});

describe('updating a link', () => {
	it('applies only the specified changes while preserving other fields', () => {
		const existing = aLink();
		const [updated] = updateLink(existing, { url: 'https://other.com' });

		expect(updated.url).toBe('https://other.com');
		expect(updated.slug).toBe(existing.slug);
		expect(updated.comments).toBe(existing.comments);
	});

	it('preserves the original creation timestamp', () => {
		const existing = aLink();
		const [updated] = updateLink(existing, { url: 'https://other.com' });

		expect(updated.createdAt).toBe(existing.createdAt);
		expect(updated.updatedAt).not.toBe(existing.updatedAt);
	});

	it('raises a link updated event containing the updated link state', () => {
		const existing = aLink();
		const [link, event] = updateLink(existing, { url: 'https://other.com' });

		expect(event).toBeInstanceOf(LinkUpdatedEvent);
		expect(event.payload).toEqual(link);
	});
});

describe('link created event', () => {
	it('identifies itself as "brevis.links.created"', () => {
		const event = new LinkCreatedEvent(aLink());

		expect(event.eventName).toBe('brevis.links.created');
	});

	it('round-trips through primitives without data loss', () => {
		const link = aLink();
		const event = new LinkCreatedEvent(link);
		const primitives = event.toPrimitives();

		const reconstructed = LinkCreatedEvent.fromPrimitives(primitives);

		expect(reconstructed.payload).toEqual(event.payload);
		expect(reconstructed.eventName).toBe(event.eventName);
		expect(reconstructed.eventId).toBe(event.eventId);
		expect(reconstructed.occurredOn.getTime()).toBe(event.occurredOn.getTime());
	});
});

describe('link updated event', () => {
	it('identifies itself as "brevis.links.updated"', () => {
		const event = new LinkUpdatedEvent(aLink());

		expect(event.eventName).toBe('brevis.links.updated');
	});

	it('round-trips through primitives without data loss', () => {
		const link = aLink();
		const event = new LinkUpdatedEvent(link);
		const primitives = event.toPrimitives();

		const reconstructed = LinkUpdatedEvent.fromPrimitives(primitives);

		expect(reconstructed.payload).toEqual(event.payload);
		expect(reconstructed.eventName).toBe(event.eventName);
		expect(reconstructed.eventId).toBe(event.eventId);
		expect(reconstructed.occurredOn.getTime()).toBe(event.occurredOn.getTime());
	});
});

describe('link deleted event', () => {
	it('identifies itself as "brevis.links.deleted"', () => {
		const event = new LinkDeletedEvent(aLink());

		expect(event.eventName).toBe('brevis.links.deleted');
	});

	it('round-trips through primitives without data loss', () => {
		const link = aLink();
		const event = new LinkDeletedEvent(link);
		const primitives = event.toPrimitives();

		const reconstructed = LinkDeletedEvent.fromPrimitives(primitives);

		expect(reconstructed.payload).toEqual(event.payload);
		expect(reconstructed.eventName).toBe(event.eventName);
		expect(reconstructed.eventId).toBe(event.eventId);
		expect(reconstructed.occurredOn.getTime()).toBe(event.occurredOn.getTime());
	});
});
