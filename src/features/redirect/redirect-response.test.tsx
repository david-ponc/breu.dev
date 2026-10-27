import { describe, expect, it } from 'vitest';

import { presentRedirectResponse } from './redirect-response';

describe('presenting redirect responses', () => {
	it('returns successful redirects unchanged', async () => {
		const response = Response.redirect('https://example.com/destination');

		expect(await presentRedirectResponse(response)).toBe(response);
	});

	it('renders a generic HTML 404 without link details for missing links', async () => {
		const response = await presentRedirectResponse(
			new Response(JSON.stringify({ message: 'Slug "private-slug" not found' }), {
				status: 404,
			}),
		);
		const html = await response.text();

		expect(response.status).toBe(404);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(html).toContain('<title>Page not found | breu.dev</title>');
		expect(html).toContain('Page not found');
		expect(html).not.toContain('private-slug');
		expect(html).not.toContain('Slug');
	});

	it('renders disabled-link responses as the same generic 404', async () => {
		const response = await presentRedirectResponse(
			new Response(JSON.stringify({ message: 'Link "private-slug" is not active' }), {
				status: 410,
			}),
		);
		const html = await response.text();

		expect(response.status).toBe(404);
		expect(html).toContain('<title>Page not found | breu.dev</title>');
		expect(html).not.toContain('private-slug');
		expect(html).not.toContain('not active');
	});
});
