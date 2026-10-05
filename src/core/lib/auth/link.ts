import type { AnonymousOptions } from 'better-auth/plugins';

import { postgresSql } from '#/contexts/shared/infrastructure/postgres/pool';
import { logger } from '#/core/lib/logging';

/**
 * Reassigns application data owned by an anonymous user to the account they
 * just signed in with. better-auth deletes the anonymous user right after this
 * hook runs, and brevis.links cascades on that delete, so a failure must
 * propagate to make the sign-in retryable instead of silently losing data.
 *
 * Every table that stores a user_id must be reassigned here.
 */
export const onLinkAccount: NonNullable<AnonymousOptions['onLinkAccount']> = async ({
	anonymousUser,
	newUser,
}) => {
	const anonymousId = anonymousUser.user.id;
	const newId = newUser.user.id;

	if (anonymousId === newId) {
		return;
	}

	await postgresSql.begin(async (sql) => {
		await sql`
			UPDATE brevis.links
			SET user_id = ${newId}
			WHERE user_id = ${anonymousId}
		`;

		await sql`
			UPDATE analytics.visits
			SET user_id = ${newId}
			WHERE user_id = ${anonymousId}
		`;
	});

	logger.info({ anonymousId, newId }, 'migrated anonymous user data on account link');
};
