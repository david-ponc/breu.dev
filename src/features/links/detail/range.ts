export const ACTIVITY_RANGES = ['7d', '14d', '30d', 'all'] as const;

export type ActivityRange = (typeof ACTIVITY_RANGES)[number];

const DAY_MS = 86_400_000;
const RANGE_DAYS = { '7d': 7, '14d': 14, '30d': 30 } as const;

export function activityWindow(range: ActivityRange, now = new Date()) {
	const until = now.toISOString();

	if (range === 'all') {
		return { since: '1970-01-01T00:00:00.000Z', until };
	}

	const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const since = new Date(today - (RANGE_DAYS[range] - 1) * DAY_MS).toISOString();

	return { since, until };
}

export function activityRangeLabel(range: ActivityRange) {
	return range === 'all' ? 'All' : range;
}
