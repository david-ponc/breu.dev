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
const linkId = '01992611-0000-7000-8000-000000000001';

beforeEach(() => {
	vi.resetAllMocks();
});

describe('GET one link', () => {
	it('rejects an unauthenticated request before querying the link', async () => {
		getSession.mockResolvedValue(null);
		const response = await app.handle(
			new Request(`http://localhost/brevis/links/${linkId}`),
		);
		expect(response.status).toBe(401);
		expect(execute).not.toHaveBeenCalled();
	});

	it('scopes the lookup to the authenticated owner', async () => {
		getSession.mockResolvedValue({
			user: { id: 'owner-id' },
			session: { id: 'session-id' },
		});
		execute.mockResolvedValue({
			id: linkId,
			userId: '01992611-0000-7000-8000-000000000002',
			slug: 'example-link',
			url: 'https://example.com',
			comments: null,
			meta: null,
			status: 'active',
			createdAt: '2026-08-01T12:00:00.000Z',
			updatedAt: '2026-08-01T12:00:00.000Z',
		});
		const response = await app.handle(
			new Request(`http://localhost/brevis/links/${linkId}`),
		);
		expect(response.status).toBe(200);
		expect(execute).toHaveBeenCalledWith(linkId, 'owner-id');
	});
});
