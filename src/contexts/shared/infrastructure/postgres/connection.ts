import { Service } from 'diod';
import type { Sql } from 'postgres';

import { brevisPool } from './pool';

@Service()
export class PostgresConnection {
	readonly sql: Sql;

	constructor() {
		this.sql = brevisPool;
	}
}
