import { Service } from 'diod';

import { LinkSlugUnavailableError } from '#/contexts/brevis/links/domain/errors/link-slug-unavailable';
import {
	createLink,
	type Link,
	type UpsertLinkCommand,
	updateLink,
} from '#/contexts/brevis/links/domain/link';
import type { LinkRepository } from '#/contexts/brevis/links/domain/link-repository';
import type { EventBus } from '#/contexts/shared/domain/events/event-bus';
import { logger } from '#/core/lib/logging';

@Service()
export class LinkUpserter {
	constructor(
		private readonly repository: LinkRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: UpsertLinkCommand): Promise<Link> {
		const existing = await this.repository.searchBySlug(command.slug);

		if (existing && existing.userId !== command.userId) {
			logger.error(`Link slug "${command.slug}" is already taken by another user.`);
			throw new LinkSlugUnavailableError(command.slug);
		}

		const [link, event] = existing ? updateLink(existing, command) : createLink(command);

		await this.repository.save(link);
		await this.eventBus.publish([event]);

		logger.info(
			{ slug: command.slug, userId: command.userId },
			existing ? 'Link updated' : 'Link created',
		);

		return link;
	}
}
