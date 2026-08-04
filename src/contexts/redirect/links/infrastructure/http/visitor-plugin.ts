import Elysia from 'elysia';

import type { Visitor } from '../../domain/link';

function extractIp(headers: Headers): string | null {
	const forwarded = headers.get('x-forwarded-for');

	return (
		forwarded?.split(',')[0]?.trim() ||
		headers.get('x-real-ip') ||
		headers.get('cf-connecting-ip') ||
		null
	);
}

export const visitorPlugin = new Elysia({ name: 'redirect.visitor' }).derive(
	{ as: 'scoped' },
	({ request }): { visitor: Visitor } => {
		const { headers } = request;

		return {
			visitor: {
				ip: extractIp(headers),
				userAgent: headers.get('user-agent'),
				referer: headers.get('referer'),
			},
		};
	},
);
