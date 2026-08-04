import pino from 'pino';

import { IS_DEVELOPMENT, IS_PRODUCTION, IS_TEST } from '#/config/env';

export const logger = pino({
	level: IS_TEST ? 'silent' : IS_DEVELOPMENT ? 'debug' : 'info',
	...(IS_DEVELOPMENT && {
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname',
			},
		},
	}),
	base: IS_PRODUCTION ? { env: process.env.NODE_ENV } : undefined,
});
