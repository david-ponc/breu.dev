import { send } from '@vercel/queue';
import { Service } from 'diod';

import type { DomainEvent } from '#/contexts/shared/domain/events/domain-event';
import type {
	DomainEventMapping,
	DomainEventPrimitives,
} from '#/contexts/shared/domain/events/domain-event-mapping';
import type {
	DomainEventHandler,
	EventBus,
} from '#/contexts/shared/domain/events/event-bus';

const TOPIC_NAME = 'domain-events';

function isDomainEventPrimitives(value: unknown): value is DomainEventPrimitives {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const event = value as Record<string, unknown>;
	return (
		typeof event.eventId === 'string' &&
		typeof event.eventName === 'string' &&
		typeof event.occurredOn === 'string' &&
		'payload' in event
	);
}

@Service()
export class VercelQueueEventBus implements EventBus {
	private readonly handlers = new Map<string, DomainEventHandler[]>();

	constructor(private readonly mapping: DomainEventMapping) {}

	async publish(events: DomainEvent[]): Promise<void> {
		await Promise.all(
			events.map((event) =>
				send(TOPIC_NAME, event.toPrimitives(), {
					idempotencyKey: event.eventId,
				}),
			),
		);
	}

	subscribe(eventName: string, handler: DomainEventHandler): void {
		const handlers = this.handlers.get(eventName) ?? [];
		this.handlers.set(eventName, [...handlers, handler]);
	}

	async consume(message: unknown): Promise<void> {
		if (!isDomainEventPrimitives(message)) {
			throw new TypeError('Invalid domain event message received from Vercel Queues');
		}

		const event = this.mapping.deserialize(message);
		const handlers = this.handlers.get(event.eventName) ?? [];

		for (const handler of handlers) {
			await handler.handle(event);
		}
	}
}
