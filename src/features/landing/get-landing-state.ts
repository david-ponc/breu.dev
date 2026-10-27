import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { LinkRepository } from '#/contexts/brevis/links/domain/link-repository';
import { container } from '#/core/container';
import { auth } from '#/core/lib/auth';

export interface LandingState {
	isSignedIn: boolean;
	hasUsedGuestLink: boolean;
}

interface LandingSession {
	user: {
		id: string;
		isAnonymous?: boolean | null;
	};
}

export async function resolveLandingState(
	session: LandingSession | null,
	countByUserId: (userId: string) => Promise<number>,
): Promise<LandingState> {
	if (!session) return { isSignedIn: false, hasUsedGuestLink: false };
	if (!session.user.isAnonymous) return { isSignedIn: true, hasUsedGuestLink: false };

	const linkCount = await countByUserId(session.user.id);
	return { isSignedIn: false, hasUsedGuestLink: linkCount > 0 };
}

export const getLandingState = createServerFn({ method: 'GET' }).handler(
	async (): Promise<LandingState> => {
		const session = await auth.api.getSession({ headers: getRequestHeaders() });

		return resolveLandingState(session, (userId) =>
			container.get(LinkRepository).countByUserId(userId),
		);
	},
);
