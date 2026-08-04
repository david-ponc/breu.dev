import { Service } from 'diod';

import { LinkNotActiveError } from '#/contexts/redirect/links/domain/errors/link-not-active';
import { LinkSlugNotFoundError } from '#/contexts/redirect/links/domain/errors/link-slug-not-found';
import {
	isResolvable,
	type Link,
	type ResolveLinkCommand,
} from '#/contexts/redirect/links/domain/link';
import type { LinkRepository } from '#/contexts/redirect/links/domain/link-repository';
import type { EventBus } from '#/contexts/shared/domain/events/event-bus';

import { LinkResolvedEvent } from '../../domain/events/link-resolved-event';

@Service()
export class LinkResolver {
	constructor(
		private readonly repository: LinkRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: ResolveLinkCommand): Promise<Link> {
		const link = await this.repository.searchBySlug(command.slug);

		if (!link) {
			throw new LinkSlugNotFoundError(command.slug);
		}

		if (!isResolvable(link.status)) {
			throw new LinkNotActiveError(command.slug);
		}

		await this.eventBus.publish([
			new LinkResolvedEvent({ link, visitor: command.visitor }),
		]);

		return link;
	}
}
