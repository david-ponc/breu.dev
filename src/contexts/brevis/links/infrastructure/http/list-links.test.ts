import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execute, getSession } = vi.hoisted(() => ({
	execute: vi.fn(),
	getSession: vi.fn(),
}));
vi.mock('#/core/container', () => ({ container: { get: () => ({ execute }) } }));
vi.mock('#/core/lib/auth/index', () => ({ auth: { api: { getSession } } }));

import { brevisLinksRoutes } from './routes';

const app = new Elysia().use(brevisLinksRoutes);

beforeEach(() => {
	vi.resetAllMocks();
	execute.mockResolvedValue([]);
});

describe('GET user links', () => {
	it('rejects an unauthenticated request before querying links', async () => {
		getSession.mockResolvedValue(null);
		const response = await app.handle(new Request('http://localhost/brevis/links/'));
		expect(response.status).toBe(401);
		expect(execute).not.toHaveBeenCalled();
	});

	it('uses the authenticated owner, ignoring a supplied userId', async () => {
		getSession.mockResolvedValue({
			user: { id: 'owner-id' },
			session: { id: 'session-id' },
		});
		const response = await app.handle(
			new Request('http://localhost/brevis/links/?userId=another-user'),
		);
		expect(response.status).toBe(200);
		expect(execute).toHaveBeenCalledWith('owner-id');
		expect(await response.json()).toEqual([]);
	});
});
