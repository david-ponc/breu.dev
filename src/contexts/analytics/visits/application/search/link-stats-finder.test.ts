import { describe, expect, it, vi } from 'vitest';

import { Identifier } from '#/core/lib/identifier';

import { LinkStatsFinder } from './link-stats-finder';

const query = {
	linkId: Identifier.generate(),
	userId: Identifier.generate(),
	since: '2026-09-01T00:00:00.000Z',
	until: '2026-09-03T16:00:00.000Z',
};

const emptyBreakdowns = {
	devices: [],
	browsers: [],
	os: [],
	referrers: [],
	countries: [],
};

describe('finding link stats', () => {
	it('fills missing days without changing totals', async () => {
		const searchStats = vi.fn().mockResolvedValue({
			lifetimeClicks: 40,
			periodClicks: 8,
			bots: 1,
			lastVisitedAt: '2026-09-03T12:00:00.000Z',
			activity: [
				{ date: '2026-09-01', clicks: 3 },
				{ date: '2026-09-03', clicks: 5 },
			],
			...emptyBreakdowns,
		});
		const finder = new LinkStatsFinder({ searchStats, searchRecent: vi.fn() });

		const stats = await finder.execute(query);

		expect(searchStats).toHaveBeenCalledWith(query);
		expect(stats.lifetimeClicks).toBe(40);
		expect(stats.activity).toEqual([
			{ date: '2026-09-01', clicks: 3 },
			{ date: '2026-09-02', clicks: 0 },
			{ date: '2026-09-03', clicks: 5 },
		]);
	});

	it('returns zeros when the link has no visits', async () => {
		const finder = new LinkStatsFinder({
			searchStats: vi.fn().mockResolvedValue({
				lifetimeClicks: 0,
				periodClicks: 0,
				bots: 0,
				lastVisitedAt: null,
				activity: [],
				...emptyBreakdowns,
			}),
			searchRecent: vi.fn(),
		});

		const stats = await finder.execute(query);

		expect(stats.lifetimeClicks).toBe(0);
		expect(stats.lastVisitedAt).toBeNull();
		expect(stats.activity.every((point) => point.clicks === 0)).toBe(true);
	});
});
