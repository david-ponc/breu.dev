import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execute, getSession } = vi.hoisted(() => ({
	execute: vi.fn(),
	getSession: vi.fn(),
}));
vi.mock('#/core/container', () => ({ container: { get: () => ({ execute }) } }));
vi.mock('#/core/lib/auth/index', () => ({ auth: { api: { getSession } } }));

import { analyticsLinksRoutes } from './routes';

const app = new Elysia().use(analyticsLinksRoutes);
const linkId = '01992611-0000-7000-8000-000000000001';
const since = '2026-09-01T00:00:00.000Z';
const until = '2026-09-14T23:59:59.000Z';

beforeEach(() => {
	vi.resetAllMocks();
	execute.mockResolvedValue({
		lifetimeClicks: 0,
		periodClicks: 0,
		bots: 0,
		lastVisitedAt: null,
		activity: [],
		devices: [],
		browsers: [],
		os: [],
		referrers: [],
		countries: [],
	});
});

describe('GET link stats', () => {
	it('rejects an unauthenticated request before querying stats', async () => {
		getSession.mockResolvedValue(null);
		const response = await app.handle(
			new Request(
				`http://localhost/analytics/links/${linkId}?since=${since}&until=${until}`,
			),
		);
		expect(response.status).toBe(401);
		expect(execute).not.toHaveBeenCalled();
	});

	it('scopes stats to the authenticated owner', async () => {
		getSession.mockResolvedValue({
			user: { id: 'owner-id' },
			session: { id: 'session-id' },
		});
		const response = await app.handle(
			new Request(
				`http://localhost/analytics/links/${linkId}?since=${since}&until=${until}`,
			),
		);
		expect(response.status).toBe(200);
		expect(execute).toHaveBeenCalledWith({
			linkId,
			userId: 'owner-id',
			since,
			until,
		});
	});
});
