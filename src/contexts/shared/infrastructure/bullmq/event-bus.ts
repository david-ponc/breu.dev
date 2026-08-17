import type { Job } from 'bullmq';
import { Queue, Worker } from 'bullmq';
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
import { logger } from '#/core/lib/logging';

import type { BullMqConnection } from './connection';

const QUEUE_NAME = 'domain_events';

@Service()
export class BullMqEventBus implements EventBus {
	private queue: Queue | undefined;
	private readonly workers: Worker[] = [];

	constructor(
		private readonly connection: BullMqConnection,
		private readonly mapping: DomainEventMapping,
	) {}

	async publish(events: DomainEvent[]): Promise<void> {
		const queue = this.getQueue();

		const jobs = events.map((event) => ({
			name: event.eventName,
			data: event.toPrimitives(),
		}));

		await queue.addBulk(jobs);
	}

	subscribe(eventName: string, handler: DomainEventHandler): void {
		const worker = new Worker<DomainEventPrimitives>(
			QUEUE_NAME,
			async (job: Job<DomainEventPrimitives>) => {
				if (job.name !== eventName) {
					return;
				}

				const event = this.mapping.deserialize(job.data);
				await handler.handle(event);
			},
			{
				connection: this.connection.connection.duplicate(),
				concurrency: 1,
			},
		);

		worker.on('failed', (job, err) => {
			logger.error({ err, job: job?.id, eventName }, 'BullMQ job failed');
		});

		worker.on('error', (err) => {
			logger.error({ err, eventName }, 'BullMQ worker error');
		});

		this.workers.push(worker);
	}

	private getQueue(): Queue {
		if (!this.queue) {
			this.queue = new Queue(QUEUE_NAME, {
				connection: this.connection.connection.duplicate(),
			});
		}

		return this.queue;
	}

	async close(): Promise<void> {
		await Promise.all(this.workers.map((worker) => worker.close()));
		if (this.queue) {
			await this.queue.close();
		}
	}
}
