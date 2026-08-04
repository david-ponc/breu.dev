import { Service } from 'diod';

import type { DomainEvent } from './domain-event';

export interface DomainEventPrimitives {
	eventId: string;
	eventName: string;
	occurredOn: string;
	payload: unknown;
}

export interface DomainEventClass {
	readonly EVENT_NAME: string;
	fromPrimitives(data: {
		eventId: string;
		occurredOn: string;
		payload: unknown;
	}): DomainEvent;
}

@Service()
export class DomainEventMapping {
	private readonly mapping: Map<string, DomainEventClass>;

	constructor(events: Record<string, DomainEventClass>) {
		this.mapping = new Map(Object.entries(events));
	}

	deserialize(primitives: DomainEventPrimitives): DomainEvent {
		const eventClass = this.mapping.get(primitives.eventName);

		if (!eventClass) {
			throw new Error(
				`Domain event mapping not found for event "${primitives.eventName}"`,
			);
		}

		return eventClass.fromPrimitives({
			eventId: primitives.eventId,
			occurredOn: primitives.occurredOn,
			payload: primitives.payload,
		});
	}
}
