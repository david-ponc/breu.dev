import type { Container } from 'diod';

import { OnLinkResolved } from '#/contexts/analytics/visits/application/subscribers/on-link-resolved';
import { OnLinkCreated } from '#/contexts/brevis/links/application/subscribers/on-link-created';
import { LinkCreatedEvent } from '#/contexts/brevis/links/domain/events/link-created-event';
import { LinkResolvedEvent } from '#/contexts/redirect/links/domain/events/link-resolved-event';
import { EventBus } from '#/contexts/shared/domain/events/event-bus';

export function registerSubscribers(container: Container): void {
	const eventBus = container.get(EventBus);

	eventBus.subscribe(LinkCreatedEvent.EVENT_NAME, container.get(OnLinkCreated));
	eventBus.subscribe(LinkResolvedEvent.EVENT_NAME, container.get(OnLinkResolved));
}
