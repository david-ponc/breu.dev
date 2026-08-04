import { DomainEvent } from '#/contexts/shared/domain/events/domain-event';

import type { Link } from '../link';

export class LinkDeletedEvent extends DomainEvent<Link> {
	static readonly EVENT_NAME = 'brevis.links.deleted' as const;
	readonly eventName = LinkDeletedEvent.EVENT_NAME;

	static fromPrimitives(data: { eventId: string; occurredOn: string; payload: Link }) {
		return new LinkDeletedEvent(data.payload, data.eventId, new Date(data.occurredOn));
	}
}
