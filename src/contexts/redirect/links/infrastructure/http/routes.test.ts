import Elysia from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock('#/core/container', () => ({ container: { get: () => ({ execute }) } }));

import { LinkNotActiveError } from '#/contexts/redirect/links/domain/errors/link-not-active';
import { LinkSlugNotFoundError } from '#/contexts/redirect/links/domain/errors/link-slug-not-found';

import { redirectLinkRoutes } from './routes';

const app = new Elysia().use(redirectLinkRoutes);

beforeEach(() => {
	vi.resetAllMocks();
});

describe('GET redirect link', () => {
	it('keeps redirecting active links', async () => {
		execute.mockResolvedValue({ url: 'https://example.com/destination' });

		const response = await app.handle(
			new Request('http://localhost/redirect/links/my-link'),
		);

		expect(response.status).toBe(302);
		expect(response.headers.get('location')).toBe('https://example.com/destination');
	});

	it('passes the Vercel country header to the link resolver', async () => {
		execute.mockResolvedValue({ url: 'https://example.com/destination' });

		await app.handle(
			new Request('http://localhost/redirect/links/my-link', {
				headers: { 'x-vercel-ip-country': 'es' },
			}),
		);

		expect(execute).toHaveBeenCalledWith({
			slug: 'my-link',
			visitor: expect.objectContaining({ country: 'ES' }),
		});
	});

	it('uses a null country when the Vercel country header is invalid', async () => {
		execute.mockResolvedValue({ url: 'https://example.com/destination' });

		await app.handle(
			new Request('http://localhost/redirect/links/my-link', {
				headers: { 'x-vercel-ip-country': 'Spain' },
			}),
		);

		expect(execute).toHaveBeenCalledWith({
			slug: 'my-link',
			visitor: expect.objectContaining({ country: null }),
		});
	});

	it.each([
		['disabled', () => new LinkNotActiveError('private-slug')],
		['unknown', () => new LinkSlugNotFoundError('private-slug')],
	])('does not reveal link details for a %s link', async (_state, error) => {
		execute.mockRejectedValue(error());

		const response = await app.handle(
			new Request('http://localhost/redirect/links/private-slug'),
		);
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(body).toEqual({ code: 'NOT_FOUND', message: 'Not found' });
		expect(JSON.stringify(body)).not.toContain('private-slug');
	});
});
