import { PostgresJSDialect } from 'kysely-postgres-js';
import type { Sql } from 'postgres';
import postgres from 'postgres';

import { IS_DEVELOPMENT, serverEnv } from '#/config/env';

function createPool(schema: string): Sql {
	return postgres(serverEnv.DATABASE_URL, {
		connection: { search_path: schema },
		max: IS_DEVELOPMENT ? 2 : 10,
		transform: { undefined: null },
		types: {
			1184: {
				to: 1184,
				from: [1184],
				parse: (value: string) => new Date(value).toISOString(),
				serialize: (value: string | Date) =>
					value instanceof Date ? value.toISOString() : value,
			},
		},
	});
}

export const authPool = {
	dialect: new PostgresJSDialect({ postgres: createPool('auth') }),
	type: 'postgres' as const,
	transaction: true,
};

export const brevisPool = createPool('brevis');
export const analyticsPool = createPool('analytics');
export const redirectPool = createPool('redirect');
