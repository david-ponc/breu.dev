import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postgres from 'postgres';

async function main(): Promise<void> {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	const currentDir = new URL('.', import.meta.url).pathname;
	const sql = postgres(databaseUrl, {
		max: 1,
		transform: { undefined: null },
	});

	try {
		const content = await readFile(resolve(currentDir, 'schema.sql'), 'utf8');
		await sql.unsafe(content);

		console.log('✅ analytics database initialized successfully');
	} finally {
		await sql.end({ timeout: 5 });
	}
}

main().catch((error) => {
	console.error('❌ failed to initialize analytics database:', error);
	process.exit(1);
});
