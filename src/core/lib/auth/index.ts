import { betterAuth } from 'better-auth';
import { anonymous } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

import { serverEnv } from '#/config/env/server';
import { authPool } from '#/contexts/shared/infrastructure/postgres/pool';
import { Identifier } from '#/core/lib/identifier';

import { onLinkAccount } from './link';

export const auth = betterAuth({
	baseURL: serverEnv.BETTER_AUTH_URL,
	basePath: '/api/auth',
	secret: serverEnv.BETTER_AUTH_SECRET,
	database: authPool,
	plugins: [
		anonymous({
			onLinkAccount,
			generateName: () => 'Invitado',
		}),
		tanstackStartCookies(),
	],
	socialProviders: {
		github: {
			clientId: serverEnv.GITHUB_CLIENT_ID,
			clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
			scope: ['read:user', 'user:email'],
		},
		discord: {
			clientId: serverEnv.DISCORD_CLIENT_ID,
			clientSecret: serverEnv.DISCORD_CLIENT_SECRET,
		},
	},
	advanced: {
		database: {
			generateId: () => Identifier.generate(),
		},
	},
});
