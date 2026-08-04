import { DomainEvent } from '#/contexts/shared/domain/events/domain-event';

import type { Link, Visitor } from '../link';

type LinkResolvedPayload = {
	link: Link;
	visitor: Visitor;
};

export class LinkResolvedEvent extends DomainEvent<LinkResolvedPayload> {
	static readonly EVENT_NAME = 'redirect.links.resolved' as const;
	readonly eventName = LinkResolvedEvent.EVENT_NAME;

	static fromPrimitives(data: {
		eventId: string;
		occurredOn: string;
		payload: LinkResolvedPayload;
	}) {
		return new LinkResolvedEvent(data.payload, data.eventId, new Date(data.occurredOn));
	}
}
