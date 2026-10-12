import postgres from 'postgres';
import { v5, v7 } from 'uuid';

/**
 * Seeds a single link with a curated set of visits that covers every icon the
 * Recent visits table can render: referrers, devices, browsers, operating
 * systems and bot/human origins. The rows are written straight into
 * `analytics.visits` with an already-parsed `user_agent` jsonb, so they bypass
 * the user-agent parser on purpose.
 *
 * `event_id` is derived deterministically from the link id, so re-running the
 * script refreshes the same rows instead of duplicating them. `id` stays a real
 * uuidv7 because the read schema (VisitLogEntrySchema) validates it as such.
 */

const SEED_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

type SeedDeviceType = 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';

interface SeedVisit {
	referer: string | null;
	browser: string | null;
	os: string | null;
	deviceType: SeedDeviceType;
	isBot: boolean;
	country: string | null;
	daysAgo: number;
}

const SEED_VISITS: SeedVisit[] = [
	// Human, desktop
	{
		referer: null,
		browser: 'Firefox',
		os: 'Windows',
		deviceType: 'desktop',
		isBot: false,
		country: 'US',
		daysAgo: 0,
	},
	{
		referer: null,
		browser: 'Chrome',
		os: 'Windows',
		deviceType: 'desktop',
		isBot: false,
		country: 'ES',
		daysAgo: 0,
	},
	{
		referer: 'https://www.facebook.com/post/123',
		browser: 'Chrome',
		os: 'Windows',
		deviceType: 'desktop',
		isBot: false,
		country: 'MX',
		daysAgo: 1,
	},
	{
		referer: 'https://x.com/someone/status/456',
		browser: 'Safari',
		os: 'macOS',
		deviceType: 'desktop',
		isBot: false,
		country: 'US',
		daysAgo: 2,
	},
	{
		referer: 'https://www.linkedin.com/feed/',
		browser: 'Edge',
		os: 'Windows',
		deviceType: 'desktop',
		isBot: false,
		country: 'DE',
		daysAgo: 5,
	},
	{
		referer: 'https://www.reddit.com/r/webdev/',
		browser: 'Firefox',
		os: 'Linux',
		deviceType: 'desktop',
		isBot: false,
		country: 'CA',
		daysAgo: 6,
	},
	{
		referer: 'https://github.com/some/repo',
		browser: 'Brave',
		os: 'macOS',
		deviceType: 'desktop',
		isBot: false,
		country: 'FR',
		daysAgo: 7,
	},
	{
		referer: 'https://t.me/somechannel',
		browser: 'Opera',
		os: 'Windows',
		deviceType: 'desktop',
		isBot: false,
		country: 'RU',
		daysAgo: 9,
	},
	// Human, mobile & tablet
	{
		referer: 'https://www.youtube.com/watch?v=abc',
		browser: 'Chrome',
		os: 'Android',
		deviceType: 'mobile',
		isBot: false,
		country: 'BR',
		daysAgo: 3,
	},
	{
		referer: 'https://www.google.com/search?q=breu',
		browser: 'Safari',
		os: 'iOS',
		deviceType: 'mobile',
		isBot: false,
		country: 'ES',
		daysAgo: 4,
	},
	{
		referer: 'https://www.instagram.com/p/xyz',
		browser: 'Samsung Internet',
		os: 'Android',
		deviceType: 'mobile',
		isBot: false,
		country: 'AR',
		daysAgo: 10,
	},
	{
		referer: 'https://web.whatsapp.com/',
		browser: 'Safari',
		os: 'iOS',
		deviceType: 'tablet',
		isBot: false,
		country: 'MX',
		daysAgo: 8,
	},
	// Unknown device (no user-agent data)
	{
		referer: null,
		browser: null,
		os: null,
		deviceType: 'unknown',
		isBot: false,
		country: 'JP',
		daysAgo: 12,
	},
	// Bots
	{
		referer: 'https://www.google.com/',
		browser: null,
		os: null,
		deviceType: 'bot',
		isBot: true,
		country: null,
		daysAgo: 1,
	},
	{
		referer: null,
		browser: null,
		os: null,
		deviceType: 'bot',
		isBot: true,
		country: null,
		daysAgo: 6,
	},
	{
		referer: 'https://www.reddit.com/',
		browser: null,
		os: null,
		deviceType: 'bot',
		isBot: true,
		country: null,
		daysAgo: 11,
	},
];

function seedEventId(linkId: string, index: number): string {
	return v5(`seed:${linkId}:${index}`, SEED_NAMESPACE);
}

async function main(): Promise<void> {
	const [linkId, userId] = process.argv.slice(2);

	if (!linkId || !userId) {
		throw new Error(
			'Usage: bun run database/analytics/seed-visits.ts <linkId> <userId>',
		);
	}

	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	const sql = postgres(databaseUrl, {
		max: 1,
		transform: { undefined: null },
	});

	const now = Date.now();
	const eventIds: string[] = [];

	try {
		for (const [index, visit] of SEED_VISITS.entries()) {
			const eventId = seedEventId(linkId, index);
			eventIds.push(eventId);

			const visitedAt = new Date(
				now - visit.daysAgo * 86_400_000 - index * 60_000,
			).toISOString();

			const userAgent = {
				browser: visit.browser,
				os: visit.os,
				deviceType: visit.deviceType,
			};

			await sql`
				INSERT INTO analytics.visits (
					id,
					event_id,
					link_id,
					user_id,
					ip,
					country,
					referer,
					user_agent_raw,
					user_agent,
					is_bot,
					visited_at
				) VALUES (
					${v7()},
					${eventId},
					${linkId},
					${userId},
					${null},
					${visit.country},
					${visit.referer},
					${null},
					${sql.json(userAgent)},
					${visit.isBot},
					${visitedAt}
				)
				ON CONFLICT (event_id) DO UPDATE SET
					link_id = EXCLUDED.link_id,
					user_id = EXCLUDED.user_id,
					country = EXCLUDED.country,
					referer = EXCLUDED.referer,
					user_agent = EXCLUDED.user_agent,
					is_bot = EXCLUDED.is_bot,
					visited_at = EXCLUDED.visited_at
			`;
		}

		console.log(`✅ seeded ${SEED_VISITS.length} visits for link ${linkId}`);

		const quotedIds = eventIds.map((id) => `  '${id}'`).join(',\n');
		console.log('\nRun this to remove the seeded rows:\n');
		console.log(
			`DELETE FROM analytics.visits\nWHERE link_id = '${linkId}'\n  AND event_id IN (\n${quotedIds}\n  );`,
		);
	} finally {
		await sql.end({ timeout: 5 });
	}
}

main().catch((error) => {
	console.error('❌ failed to seed visits:', error);
	process.exit(1);
});
