import { Service } from 'diod';

import type { DomainEvent } from '../domain/events/domain-event';
import type { DomainEventHandler, EventBus } from '../domain/events/event-bus';

@Service()
export class InMemoryEventBus implements EventBus {
	private handlers: Map<string, DomainEventHandler[]>;
	publishedEvents: DomainEvent[];

	constructor() {
		this.handlers = new Map();
		this.publishedEvents = [];
	}

	async publish(events: DomainEvent[]): Promise<void> {
		for (const event of events) {
			const handlers = this.handlers.get(event.eventName) ?? [];
			for (const handler of handlers) {
				await handler.handle(event);
			}
		}
		this.publishedEvents.push(...events);
	}

	subscribe(eventName: string, handler: DomainEventHandler): void {
		const existing = this.handlers.get(eventName) ?? [];
		this.handlers.set(eventName, [...existing, handler]);
	}
}
