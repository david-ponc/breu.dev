import { beforeEach, describe, expect, it } from 'vitest';

import { VisitRecorder } from '#/contexts/analytics/visits/application/record/visit-recorder';
import type {
	UserAgentParseResult,
	UserAgentParser,
} from '#/contexts/analytics/visits/domain/user-agent-parser';
import { DEVICE_TYPE } from '#/contexts/analytics/visits/domain/visit';
import { InMemoryVisitRepository } from '#/contexts/analytics/visits/infrastructure/in-memory-visit-repository';
import { LinkResolvedEvent } from '#/contexts/redirect/links/domain/events/link-resolved-event';
import {
	type Link,
	LinkSchema,
	type Visitor,
} from '#/contexts/redirect/links/domain/link';
import { DomainEvent } from '#/contexts/shared/domain/events/domain-event';
import { Identifier } from '#/core/lib/identifier';
import type { Maybe } from '#/core/types';

import { OnLinkResolved } from './on-link-resolved';

class OtherEvent extends DomainEvent<{ ok: true }> {
	readonly eventName = 'something.else';
}

class FakeUserAgentParser implements UserAgentParser {
	parse(raw: Maybe<string>): Maybe<UserAgentParseResult> {
		if (!raw) {
			return null;
		}

		return {
			userAgent: {
				browser: 'Chrome',
				os: 'macOS',
				deviceType: DEVICE_TYPE.Desktop,
			},
			isBot: false,
		};
	}
}

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

describe('on link resolved', () => {
	let repository: InMemoryVisitRepository;
	let handler: OnLinkResolved;

	beforeEach(() => {
		repository = new InMemoryVisitRepository();
		const recorder = new VisitRecorder(repository, new FakeUserAgentParser());
		handler = new OnLinkResolved(recorder);
	});

	it('records a visit from the resolved event', async () => {
		const link = aLink();
		const visitor = aVisitor();
		const event = new LinkResolvedEvent({ link, visitor });

		await handler.handle(event);

		const [visit] = await repository.findAll();
		expect(visit).toMatchObject({
			eventId: event.eventId,
			linkId: link.id,
			userId: link.userId,
			ip: visitor.ip,
			referer: visitor.referer,
			userAgentRaw: visitor.userAgent,
			visitedAt: event.occurredOn.toISOString(),
			userAgent: {
				browser: 'Chrome',
				os: 'macOS',
				deviceType: DEVICE_TYPE.Desktop,
			},
			isBot: false,
			country: null,
		});
	});

	it('ignores unrelated domain events', async () => {
		await handler.handle(new OtherEvent({ ok: true }));

		expect(await repository.findAll()).toHaveLength(0);
	});
});
