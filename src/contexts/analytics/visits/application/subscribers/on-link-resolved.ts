import { Service } from 'diod';

import type { VisitRecorder } from '#/contexts/analytics/visits/application/record/visit-recorder';
import { LinkResolvedEvent } from '#/contexts/redirect/links/domain/events/link-resolved-event';
import type { DomainEvent } from '#/contexts/shared/domain/events/domain-event';
import { DomainEventHandler } from '#/contexts/shared/domain/events/event-bus';

@Service()
export class OnLinkResolved extends DomainEventHandler {
	constructor(private readonly visitRecorder: VisitRecorder) {
		super();
	}

	async handle(event: DomainEvent): Promise<void> {
		if (!(event instanceof LinkResolvedEvent)) {
			return;
		}

		const { link, visitor } = event.payload;

		await this.visitRecorder.execute({
			eventId: event.eventId,
			linkId: link.id,
			userId: link.userId,
			ip: visitor.ip,
			referer: visitor.referer,
			userAgentRaw: visitor.userAgent,
			visitedAt: event.occurredOn.toISOString(),
		});
	}
}
