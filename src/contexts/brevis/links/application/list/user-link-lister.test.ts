import { describe, expect, it, vi } from 'vitest';

import type { LinkSummary } from '../../domain/link-summary';
import { UserLinkLister } from './user-link-lister';

const now = new Date('2026-09-08T16:30:00.000Z');
const link: LinkSummary = {
	id: '01992611-0000-7000-8000-000000000001',
	slug: 'example-link',
	url: 'https://example.com',
	status: 'active',
	createdAt: '2026-08-01T12:00:00.000Z',
	totalClicks: 120,
	activity: [
		{ date: '2026-09-01', clicks: 3 },
		{ date: '2026-09-08', clicks: 5 },
	],
};

describe('listing user links', () => {
	it('scopes the lookup to the user with a UTC window including today', async () => {
		const searchByUserId = vi.fn().mockResolvedValue([link]);
		await new UserLinkLister({ searchByUserId }).execute('owner-id', now);
		expect(searchByUserId).toHaveBeenCalledWith(
			'owner-id',
			'2026-08-26T00:00:00.000Z',
			now.toISOString(),
		);
	});

	it('fills missing days in chronological order without changing the lifetime total', async () => {
		const lister = new UserLinkLister({
			searchByUserId: vi.fn().mockResolvedValue([link]),
		});
		const [result] = await lister.execute('owner-id', now);
		expect(result?.activity).toHaveLength(14);
		expect(result?.activity[0]).toEqual({ date: '2026-08-26', clicks: 0 });
		expect(result?.activity[6]).toEqual({ date: '2026-09-01', clicks: 3 });
		expect(result?.activity[13]).toEqual({ date: '2026-09-08', clicks: 5 });
		expect(result?.totalClicks).toBe(120);
		expect(link.activity).toHaveLength(2);
	});

	it('returns a flat zero series for a link without visits', async () => {
		const lister = new UserLinkLister({
			searchByUserId: vi
				.fn()
				.mockResolvedValue([{ ...link, totalClicks: 0, activity: [] }]),
		});
		const [result] = await lister.execute('owner-id', now);
		expect(result?.activity.every((point) => point.clicks === 0)).toBe(true);
		expect(result?.totalClicks).toBe(0);
	});

	it('returns no rows for users with no links', async () => {
		const lister = new UserLinkLister({ searchByUserId: vi.fn().mockResolvedValue([]) });
		await expect(lister.execute('new-user', now)).resolves.toEqual([]);
	});

	it('propagates failures instead of presenting an empty list', async () => {
		const lister = new UserLinkLister({
			searchByUserId: vi.fn().mockRejectedValue(new Error('Database unavailable')),
		});
		await expect(lister.execute('owner-id', now)).rejects.toThrow('Database unavailable');
	});
});
