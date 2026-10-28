import { definePlugin } from 'nitro';

import { EventBus } from '#/contexts/shared/domain/events/event-bus';
import { VercelQueueEventBus } from '#/contexts/shared/infrastructure/vercel-queue/event-bus';
import { container } from '#/core/container';

export default definePlugin((nitro) => {
	nitro.hooks.hook('vercel:queue', async ({ message }) => {
		const eventBus = container.get(EventBus);

		if (!(eventBus instanceof VercelQueueEventBus)) {
			throw new Error('The configured event bus cannot consume Vercel Queue messages');
		}

		await eventBus.consume(message);
	});
});
