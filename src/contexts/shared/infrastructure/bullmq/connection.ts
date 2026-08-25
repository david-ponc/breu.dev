import { Service } from 'diod';
import IORedis from 'ioredis';

import { serverEnv } from '#/config/env/server';
import { logger } from '#/core/lib/logging';

@Service()
export class BullMqConnection {
	readonly connection: IORedis;

	constructor() {
		this.connection = new IORedis(serverEnv.REDIS_URL, {
			maxRetriesPerRequest: null,
		});

		this.connection.on('error', (err) => {
			logger.error({ err }, 'Redis connection error');
		});

		this.connection.on('connect', () => {
			logger.info('Redis connection established');
		});
	}

	async close(): Promise<void> {
		await this.connection.quit();
	}
}
