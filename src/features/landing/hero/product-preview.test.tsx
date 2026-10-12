// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ProductPreview } from './product-preview';

afterEach(cleanup);

describe('ProductPreview', () => {
	it('renders the section navigation as a decorative, non-focusable control', () => {
		render(<ProductPreview />);

		const overview = screen.getByText('Overview');
		expect(overview.tagName).toBe('SPAN');
		expect(overview.getAttribute('aria-hidden')).toBe('true');
		expect(overview.getAttribute('tabindex')).toBe('-1');
		expect(overview.hasAttribute('data-active')).toBe(true);
		expect(screen.getByText('Recent visits').tagName).toBe('SPAN');
		expect(screen.getByText('Settings').tagName).toBe('SPAN');
	});

	it('reuses the real activity chart with a descriptive label', () => {
		render(<ProductPreview />);

		expect(
			screen.getByRole('img', {
				name: /Example activity: 1,000 clicks over the last 14 days/,
			}),
		).toBeDefined();
	});

	it('renders the destination open graph preview', () => {
		render(<ProductPreview />);

		expect(screen.getByText('Launch notes')).toBeDefined();
		expect(screen.getByText('Breu Journal')).toBeDefined();
	});
});
