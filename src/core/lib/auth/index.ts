import { render, toPlainText } from '@react-email/render';
import { betterAuth } from 'better-auth';
import { anonymous, magicLink } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { createElement } from 'react';
import { Resend } from 'resend';

import { serverEnv } from '#/config/env/server';
import { authPool } from '#/contexts/shared/infrastructure/postgres/pool';
import { Identifier } from '#/core/lib/identifier';
import { logger } from '#/core/lib/logging';

import { onLinkAccount } from './link';
import { MagicLinkEmail } from './magic-link-email';

const resend = serverEnv.RESEND_API_KEY
	? new Resend(serverEnv.RESEND_API_KEY)
	: undefined;

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
		magicLink({
			disableSignUp: false,
			expiresIn: 300,
			sendMagicLink: async ({ email, url }) => {
				if (!resend) {
					logger.error('RESEND_API_KEY is not configured; magic link email was not sent');
					return;
				}

				try {
					const logoUrl = new URL('/breu-logo.png', serverEnv.BETTER_AUTH_URL).toString();
					const html = await render(createElement(MagicLinkEmail, { logoUrl, url }));
					const { error } = await resend.emails.send({
						from: serverEnv.RESEND_FROM,
						to: email,
						subject: 'Your Breu sign-in link',
						text: toPlainText(html),
						html,
					});

					if (error) {
						logger.error({ err: error }, 'Failed to send magic link email');
					}
				} catch (error: unknown) {
					logger.error({ err: error }, 'Failed to send magic link email');
				}
			},
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
