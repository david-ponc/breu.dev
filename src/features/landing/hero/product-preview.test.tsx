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

	it('renders the real activity chart as a decorative visual', () => {
		const { container } = render(<ProductPreview />);

		expect(container.querySelector('[aria-hidden][inert] svg')).not.toBeNull();
	});

	it('renders the destination open graph preview', () => {
		render(<ProductPreview />);

		expect(screen.getByText('Launch notes')).toBeDefined();
		expect(screen.getByText('Breu Journal')).toBeDefined();
	});

	it('clips the preview window with a fade and expands it on focus', () => {
		const { container } = render(<ProductPreview />);
		const viewport = container.querySelector('[data-slot="product-preview-viewport"]');
		const frame = container.querySelector('[data-slot="product-preview-frame"]');

		expect(viewport).not.toBeNull();
		expect(frame).not.toBeNull();
		expect(viewport?.classList.contains('overflow-hidden')).toBe(true);
		expect(viewport?.classList.contains('max-h-256')).toBe(true);
		expect(viewport?.classList.contains('lg:max-h-140')).toBe(true);
		expect(viewport?.classList.contains('focus-within:max-h-none')).toBe(true);
		expect(viewport?.classList.contains('mask-b-from-90%')).toBe(true);
		expect(viewport?.classList.contains('focus-within:mask-none')).toBe(true);
		expect(frame?.classList.contains('overflow-hidden')).toBe(false);
	});
});
