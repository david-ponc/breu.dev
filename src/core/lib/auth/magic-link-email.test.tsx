import { render, toPlainText } from '@react-email/render';
import { describe, expect, it } from 'vitest';

import { MagicLinkEmail } from './magic-link-email';

describe('MagicLinkEmail', () => {
	it('renders a branded sign-in link with an accessible plain-text fallback', async () => {
		const url =
			'https://breu.dev/api/auth/magic-link?token=secret&callbackURL=%2Fdashboard%2Flinks';
		const html = await render(
			<MagicLinkEmail url={url} logoUrl='https://breu.dev/breu-logo.svg' />,
		);
		const text = toPlainText(html);

		expect(html).toContain('Your link is ready');
		expect(html).toContain('alt="Breu"');
		expect(html).toContain('src="https://breu.dev/breu-logo.svg"');
		expect(html).toContain('padding:32px 36px');
		expect(html).toContain(`href="${url.replaceAll('&', '&amp;')}"`);
		expect(text).toContain('This link expires in 5 minutes.');
		expect(text).toContain(url);
		expect(text).toContain('If you didn’t request this email');
	});
});
