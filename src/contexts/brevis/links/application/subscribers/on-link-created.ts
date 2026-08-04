import { Service } from 'diod';

import type { DomainEvent } from '#/contexts/shared/domain/events/domain-event';
import { DomainEventHandler } from '#/contexts/shared/domain/events/event-bus';
import { logger } from '#/core/lib/logging';

@Service()
export class OnLinkCreated extends DomainEventHandler {
	async handle(event: DomainEvent): Promise<void> {
		logger.info({ event: event.toPrimitives() }, 'Link created event handled');
	}
}
