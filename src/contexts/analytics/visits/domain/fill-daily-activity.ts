import type { LinkActivity } from './link-stats';

const DAY_MS = 86_400_000;
const MAX_FILL_DAYS = 90;

export function fillDailyActivity(
	activity: LinkActivity[],
	since: string,
	until: string,
): LinkActivity[] {
	const start = utcDay(since);
	const end = utcDay(until);
	const days = Math.floor((end - start) / DAY_MS) + 1;

	if (days < 1 || days > MAX_FILL_DAYS) {
		return activity;
	}

	const counts = new Map(activity.map((point) => [point.date, point.clicks]));

	return Array.from({ length: days }, (_, index) => {
		const date = new Date(start + index * DAY_MS).toISOString().slice(0, 10);
		return { date, clicks: counts.get(date) ?? 0 };
	});
}

function utcDay(iso: string): number {
	const date = new Date(iso);
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
