import { describe, expect, it } from 'vitest';

import { fillDailyActivity } from './fill-daily-activity';

describe('filling daily activity', () => {
	it('fills missing days in chronological order', () => {
		const filled = fillDailyActivity(
			[
				{ date: '2026-09-01', clicks: 3 },
				{ date: '2026-09-03', clicks: 5 },
			],
			'2026-09-01T00:00:00.000Z',
			'2026-09-03T16:00:00.000Z',
		);

		expect(filled).toEqual([
			{ date: '2026-09-01', clicks: 3 },
			{ date: '2026-09-02', clicks: 0 },
			{ date: '2026-09-03', clicks: 5 },
		]);
	});

	it('returns a zero series when there is no activity', () => {
		const filled = fillDailyActivity(
			[],
			'2026-09-07T00:00:00.000Z',
			'2026-09-08T12:00:00.000Z',
		);

		expect(filled).toEqual([
			{ date: '2026-09-07', clicks: 0 },
			{ date: '2026-09-08', clicks: 0 },
		]);
	});

	it('does not fill windows longer than 90 days', () => {
		const activity = [{ date: '2026-01-01', clicks: 2 }];
		const filled = fillDailyActivity(
			activity,
			'2026-01-01T00:00:00.000Z',
			'2026-06-01T00:00:00.000Z',
		);

		expect(filled).toBe(activity);
	});
});
