import { betterAuth } from 'better-auth';
import { anonymous, magicLink } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { Resend } from 'resend';

import { serverEnv } from '#/config/env/server';
import { authPool } from '#/contexts/shared/infrastructure/postgres/pool';
import { Identifier } from '#/core/lib/identifier';
import { logger } from '#/core/lib/logging';

import { onLinkAccount } from './link';

const resend = serverEnv.RESEND_API_KEY
	? new Resend(serverEnv.RESEND_API_KEY)
	: undefined;

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
		};

		return entities[character] ?? character;
	});
}

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
			sendMagicLink: ({ email, url }) => {
				if (!resend) {
					logger.error('RESEND_API_KEY is not configured; magic link email was not sent');
					return;
				}

				const safeUrl = escapeHtml(url);

				void resend.emails
					.send({
						from: serverEnv.RESEND_FROM,
						to: email,
						subject: 'Your Breu sign-in link',
						text: `Use this link to sign in to Breu: ${url}\n\nThis link expires in 5 minutes. If you didn't request it, you can ignore this email.`,
						html: `<p>Use the link below to sign in to Breu. It expires in 5 minutes.</p><p><a href="${safeUrl}">Sign in to Breu</a></p><p>If you didn't request this email, you can ignore it.</p>`,
					})
					.then(({ error }) => {
						if (error) {
							logger.error({ err: error }, 'Failed to send magic link email');
						}
					})
					.catch((error: unknown) => {
						logger.error({ err: error }, 'Failed to send magic link email');
					});
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
