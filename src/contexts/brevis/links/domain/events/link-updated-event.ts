import { DomainEvent } from '#/contexts/shared/domain/events/domain-event';

import type { Link } from '../link';

export class LinkUpdatedEvent extends DomainEvent<Link> {
	static readonly EVENT_NAME = 'brevis.links.updated' as const;
	readonly eventName = LinkUpdatedEvent.EVENT_NAME;

	static fromPrimitives(data: { eventId: string; occurredOn: string; payload: Link }) {
		return new LinkUpdatedEvent(data.payload, data.eventId, new Date(data.occurredOn));
	}
}
