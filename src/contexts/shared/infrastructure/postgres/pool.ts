import { PostgresJSDialect } from 'kysely-postgres-js';
import type { Sql } from 'postgres';
import postgres from 'postgres';

import { IS_DEVELOPMENT, serverEnv } from '#/config/env/server';

type PoolOptions = {
	searchPath?: string;
};

function createSql(options: PoolOptions = {}): Sql {
	return postgres(serverEnv.DATABASE_URL, {
		...(options.searchPath !== undefined && {
			connection: { search_path: options.searchPath },
		}),
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

export const postgresSql = createSql();

export const authPool = {
	dialect: new PostgresJSDialect({ postgres: createSql({ searchPath: 'auth' }) }),
	type: 'postgres' as const,
	transaction: true,
};
