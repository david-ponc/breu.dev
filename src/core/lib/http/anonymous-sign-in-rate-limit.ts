import IORedis from 'ioredis';

import { serverEnv } from '#/config/env/server';
import { logger } from '#/core/lib/logging';

import { STATUS_CODES } from './status-codes';

const WINDOW_SECONDS = 60 * 60;
const MAX_ATTEMPTS = 5;
const ANON_SIGN_IN_PATH = '/sign-in/anonymous';

const redis = new IORedis(serverEnv.REDIS_URL, {
	maxRetriesPerRequest: 1,
	enableOfflineQueue: false,
});

redis.on('error', (err) => {
	logger.error({ err }, 'Redis connection error');
});

const clientIp = (headers: Headers): string =>
	headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

/**
 * Guards POST /sign-in/anonymous, which is public and inserts a user row on
 * every call. Fails open: if Redis is down the sign-in must keep working.
 */
export const withAnonymousSignInRateLimit =
	(handler: (request: Request) => Response | Promise<Response>) =>
	async (request: Request): Promise<Response> => {
		const { pathname } = new URL(request.url);

		if (request.method !== 'POST' || !pathname.endsWith(ANON_SIGN_IN_PATH)) {
			return handler(request);
		}

		const key = `rate-limit:anon-sign-in:${clientIp(request.headers)}`;

		try {
			const attempts = await redis.incr(key);

			if (attempts === 1) {
				await redis.expire(key, WINDOW_SECONDS);
			}

			if (attempts > MAX_ATTEMPTS) {
				return new Response(
					JSON.stringify({
						message: 'Too many anonymous sign-ins, try again later.',
					}),
					{
						status: STATUS_CODES.TooManyRequests,
						headers: { 'content-type': 'application/json' },
					},
				);
			}
		} catch (err) {
			logger.error({ err }, 'anonymous sign-in rate limit unavailable, allowing request');
		}

		return handler(request);
	};
