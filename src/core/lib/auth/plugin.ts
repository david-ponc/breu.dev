import { Elysia } from 'elysia';

import { STATUS_CODES } from '#/core/lib/http/status-codes';

import { auth } from './index';

export const authPlugin = new Elysia({ name: 'auth' }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			const session = await auth.api.getSession({ headers });

			if (!session) {
				return status(STATUS_CODES.Unauthorized);
			}

			return {
				user: session.user,
				session: session.session,
			};
		},
	},
});

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;
