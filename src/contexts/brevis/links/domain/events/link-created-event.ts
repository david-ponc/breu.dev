import { DomainEvent } from '#/contexts/shared/domain/events/domain-event';

import type { Link } from '../link';

export class LinkCreatedEvent extends DomainEvent<Link> {
	static readonly EVENT_NAME = 'brevis.links.created' as const;
	readonly eventName = LinkCreatedEvent.EVENT_NAME;

	static fromPrimitives(data: { eventId: string; occurredOn: string; payload: Link }) {
		return new LinkCreatedEvent(data.payload, data.eventId, new Date(data.occurredOn));
	}
}
