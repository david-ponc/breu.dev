import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainEvent } from '#/contexts/shared/domain/events/domain-event';
import {
	DomainEventMapping,
	type DomainEventPrimitives,
} from '#/contexts/shared/domain/events/domain-event-mapping';
import { DomainEventHandler } from '#/contexts/shared/domain/events/event-bus';

import { VercelQueueEventBus } from './event-bus';

vi.mock('@vercel/queue', () => ({
	send: vi.fn().mockResolvedValue({ messageId: 'message-id' }),
}));

import { send } from '@vercel/queue';

class TestEvent extends DomainEvent<{ value: string }> {
	static readonly EVENT_NAME = 'test.event';
	readonly eventName = TestEvent.EVENT_NAME;

	static fromPrimitives(data: DomainEventPrimitives): TestEvent {
		return new TestEvent(
			data.payload as { value: string },
			data.eventId,
			new Date(data.occurredOn),
		);
	}
}

class TestHandler extends DomainEventHandler {
	readonly handled: DomainEvent[] = [];

	async handle(event: DomainEvent): Promise<void> {
		this.handled.push(event);
	}
}

describe('VercelQueueEventBus', () => {
	let eventBus: VercelQueueEventBus;

	beforeEach(() => {
		vi.clearAllMocks();
		eventBus = new VercelQueueEventBus(
			new DomainEventMapping({ [TestEvent.EVENT_NAME]: TestEvent }),
		);
	});

	it('publishes primitive events with an idempotency key', async () => {
		const event = new TestEvent({ value: 'test' }, 'event-id');

		await eventBus.publish([event]);

		expect(send).toHaveBeenCalledWith('domain-events', event.toPrimitives(), {
			idempotencyKey: 'event-id',
		});
	});

	it('dispatches a consumed message to subscribers for its event name', async () => {
		const handler = new TestHandler();
		eventBus.subscribe(TestEvent.EVENT_NAME, handler);
		const message = new TestEvent({ value: 'test' }, 'event-id').toPrimitives();

		await eventBus.consume(message);

		expect(handler.handled[0]).toBeInstanceOf(TestEvent);
		expect(handler.handled[0]?.payload).toEqual({ value: 'test' });
	});

	it('rejects messages that are not domain event primitives', async () => {
		await expect(eventBus.consume({ eventName: 'missing-fields' })).rejects.toThrow(
			'Invalid domain event message',
		);
	});
});
