import { Service } from 'diod';

import { AnonymousActionForbiddenError } from '#/contexts/brevis/links/domain/errors/anonymous-action-forbidden';
import { LinkNotFoundError } from '#/contexts/brevis/links/domain/errors/link-not-found';
import { LinkDeletedEvent } from '#/contexts/brevis/links/domain/events/link-deleted-event';
import type { DeleteLinkCommand } from '#/contexts/brevis/links/domain/link';
import type { LinkRepository } from '#/contexts/brevis/links/domain/link-repository';
import type { EventBus } from '#/contexts/shared/domain/events/event-bus';
import { logger } from '#/core/lib/logging';

@Service()
export class LinkDeleter {
	constructor(
		private readonly repository: LinkRepository,
		private readonly eventBus: EventBus,
	) {}

	async execute(command: DeleteLinkCommand): Promise<void> {
		if (command.isAnonymous) {
			logger.warn(
				{ id: command.id, userId: command.userId },
				'Anonymous user attempted to delete a link',
			);
			throw new AnonymousActionForbiddenError();
		}

		const link = await this.repository.findById(command.id);

		if (link.userId !== command.userId) {
			logger.warn(
				{ id: command.id, userId: command.userId },
				'Attempted to delete a link owned by another user',
			);
			throw new LinkNotFoundError(command.id);
		}

		await this.repository.delete(command.id);
		await this.eventBus.publish([new LinkDeletedEvent(link)]);

		logger.info({ id: command.id, userId: command.userId }, 'Link deleted');
	}
}
