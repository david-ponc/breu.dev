import { Service } from 'diod';
import type { Consumer, Publisher } from 'rabbitmq-client';

import type { DomainEvent } from '#/contexts/shared/domain/events/domain-event';
import type {
	DomainEventMapping,
	DomainEventPrimitives,
} from '#/contexts/shared/domain/events/domain-event-mapping';
import type {
	DomainEventHandler,
	EventBus,
} from '#/contexts/shared/domain/events/event-bus';
import { logger } from '#/core/lib/logging';

import type { RabbitMqConnection } from './connection';

const EXCHANGE = 'domain_events';

@Service()
export class RabbitMqEventBus implements EventBus {
	private publisher: Publisher | undefined;
	private readonly consumers: Consumer[] = [];

	constructor(
		private readonly connection: RabbitMqConnection,
		private readonly mapping: DomainEventMapping,
	) {}

	async publish(events: DomainEvent[]): Promise<void> {
		const publisher = this.getPublisher();

		for (const event of events) {
			await publisher.send(
				{ exchange: EXCHANGE, routingKey: event.eventName },
				event.toPrimitives(),
			);
		}
	}

	subscribe(eventName: string, handler: DomainEventHandler): void {
		const queue = `${eventName}.${handler.constructor.name}`;

		const consumer = this.connection.connection.createConsumer(
			{
				queue,
				queueOptions: { durable: true },
				exchanges: [{ exchange: EXCHANGE, type: 'topic', durable: true }],
				queueBindings: [{ exchange: EXCHANGE, routingKey: eventName }],
				concurrency: 1,
				qos: { prefetchCount: 1 },
			},
			async (msg) => {
				const primitives = msg.body as DomainEventPrimitives;
				const event = this.mapping.deserialize(primitives);
				await handler.handle(event);
			},
		);

		consumer.on('error', (err) => {
			logger.error({ err, queue }, 'RabbitMQ consumer error');
		});

		this.consumers.push(consumer);
	}

	private getPublisher(): Publisher {
		if (!this.publisher) {
			this.publisher = this.connection.connection.createPublisher({
				confirm: true,
				maxAttempts: 3,
				exchanges: [{ exchange: EXCHANGE, type: 'topic', durable: true }],
			});
		}

		return this.publisher;
	}
}
