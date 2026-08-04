import { Service } from 'diod';
import { Connection } from 'rabbitmq-client';

import { serverEnv } from '#/config/env';
import { logger } from '#/core/lib/logging';

@Service()
export class RabbitMqConnection {
	readonly connection: Connection;

	constructor() {
		this.connection = new Connection(serverEnv.RABBITMQ_URL);

		this.connection.on('error', (err) => {
			logger.error({ err }, 'RabbitMQ connection error');
		});

		this.connection.on('connection', () => {
			logger.info('RabbitMQ connection (re)established');
		});
	}

	async close(): Promise<void> {
		await this.connection.close();
	}
}
