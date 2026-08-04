import { beforeEach, describe, expect, it } from 'vitest';

import { LinkNotActiveError } from '#/contexts/redirect/links/domain/errors/link-not-active';
import { LinkSlugNotFoundError } from '#/contexts/redirect/links/domain/errors/link-slug-not-found';
import { LinkResolvedEvent } from '#/contexts/redirect/links/domain/events/link-resolved-event';
import {
	type Link,
	LinkSchema,
	type ResolveLinkCommand,
	type Visitor,
} from '#/contexts/redirect/links/domain/link';
import { InMemoryLinkRepository } from '#/contexts/redirect/links/infrastructure/in-memory-link-repository';
import { InMemoryEventBus } from '#/contexts/shared/infrastructure/in-memory-event-bus';
import { Identifier } from '#/core/lib/identifier';

import { LinkResolver } from './link-resolver';

function aLink(overrides?: Partial<Link>): Link {
	return LinkSchema.parse({
		id: Identifier.generate(),
		userId: Identifier.generate(),
		slug: 'my-link',
		url: 'https://example.com',
		status: 'active',
		...overrides,
	});
}

function aVisitor(overrides?: Partial<Visitor>): Visitor {
	return {
		ip: '203.0.113.10',
		userAgent: 'Mozilla/5.0',
		referer: 'https://google.com',
		...overrides,
	};
}

function aResolveCommand(overrides?: Partial<ResolveLinkCommand>): ResolveLinkCommand {
	return {
		slug: 'my-link',
		visitor: aVisitor(),
		...overrides,
	};
}

describe('resolving a link', () => {
	let repository: InMemoryLinkRepository;
	let eventBus: InMemoryEventBus;
	let resolver: LinkResolver;

	beforeEach(() => {
		repository = new InMemoryLinkRepository();
		eventBus = new InMemoryEventBus();
		resolver = new LinkResolver(repository, eventBus);
	});

	it('returns the link and publishes the resolution with the visitor', async () => {
		const link = aLink();
		await repository.save(link);
		const command = aResolveCommand({ slug: link.slug });

		const resolved = await resolver.execute(command);

		expect(resolved).toEqual(link);
		expect(eventBus.publishedEvents).toHaveLength(1);
		expect(eventBus.publishedEvents[0]).toBeInstanceOf(LinkResolvedEvent);
		expect(eventBus.publishedEvents[0]?.payload).toEqual({
			link,
			visitor: command.visitor,
		});
	});

	it('throws not found and does not publish when the slug is unknown', async () => {
		const command = aResolveCommand({ slug: 'missing-slug' });

		await expect(resolver.execute(command)).rejects.toThrow(LinkSlugNotFoundError);
		expect(eventBus.publishedEvents).toHaveLength(0);
	});

	it('throws not active and does not publish when the link is not resolvable', async () => {
		const link = aLink({ status: 'disabled' });
		await repository.save(link);
		const command = aResolveCommand({ slug: link.slug });

		await expect(resolver.execute(command)).rejects.toThrow(LinkNotActiveError);
		expect(eventBus.publishedEvents).toHaveLength(0);
	});
});
