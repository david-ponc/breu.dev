import { Service } from 'diod';

import type { DomainEvent } from './domain-event';

@Service()
export abstract class EventBus {
	abstract publish(events: DomainEvent[]): Promise<void>;
	abstract subscribe(eventName: string, handler: DomainEventHandler): void;
}

@Service()
export abstract class DomainEventHandler {
	abstract handle(event: DomainEvent): Promise<void>;
}
