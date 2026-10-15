// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Toaster, toastManager } from './toast';

afterEach(() => {
	act(() => toastManager.close());
	cleanup();
});

it('preserves the loading indicator across progress updates and replaces it on completion', () => {
	render(<Toaster />);
	let id = '';
	act(() => {
		id = toastManager.add({
			type: 'loading',
			title: 'Deleting links',
			description: '0 of 3',
			timeout: 0,
		});
	});
	const toast = document.querySelector('[data-slot="toast"]');
	const icon = document.querySelector('[data-slot="toast-icon"][data-type="loading"]');
	expect(icon?.querySelector('[data-spinner]')).not.toBeNull();
	for (let progress = 1; progress <= 3; progress++) {
		act(() =>
			toastManager.update(id, { type: 'loading', description: `${progress} of 3` }),
		);
		expect(document.querySelector('[data-slot="toast-icon"][data-type="loading"]')).toBe(
			icon,
		);
	}
	act(() => toastManager.update(id, { type: 'success', title: 'Links deleted' }));
	const successIcon = document.querySelector(
		'[data-slot="toast-icon"][data-type="success"]',
	);
	expect(successIcon).not.toBeNull();
	expect(successIcon).not.toBe(icon);
	expect(successIcon?.querySelector('[data-spinner]')).toBeNull();
	expect(document.querySelector('[data-slot="toast"]')).toBe(toast);
	expect(toast?.className).toContain('height_200ms_cubic-bezier(0.77,0,0.175,1)');
});

it('replaces the loading indicator with the error icon when a promise fails', () => {
	render(<Toaster />);
	let id = '';
	act(() => {
		id = toastManager.add({
			type: 'loading',
			title: 'Saving link',
			timeout: 0,
		});
	});

	act(() => toastManager.update(id, { type: 'error', title: 'Failed to save link' }));

	const errorIcon = document.querySelector('[data-slot="toast-icon"][data-type="error"]');
	expect(errorIcon).not.toBeNull();
	expect(errorIcon?.querySelector('[data-spinner]')).toBeNull();
});

it('places account prompt actions below the copy without changing other toast layouts', () => {
	render(<Toaster />);
	act(() => {
		toastManager.add({
			type: 'info',
			title: 'Keep your link',
			description: 'Create a free account to edit it.',
			timeout: 0,
			data: { layout: 'account-prompt' },
			actionProps: { children: 'Create account' },
		});
		toastManager.add({
			type: 'info',
			title: 'Link updated',
			description: 'Your changes have been saved.',
			timeout: 0,
			actionProps: { children: 'View link' },
		});
	});

	const contents = Array.from(document.querySelectorAll('[data-slot="toast-content"]'));
	expect(contents).toHaveLength(2);
	const accountPrompt = contents.find((content) =>
		content.textContent?.includes('Keep your link'),
	);
	const regularToast = contents.find((content) =>
		content.textContent?.includes('Link updated'),
	);
	expect(accountPrompt?.className).toContain('grid-cols-[auto_minmax(0,1fr)_auto]');
	expect(accountPrompt?.querySelector('[data-slot="toast-action"]')?.className).toContain(
		'row-start-2',
	);
	expect(regularToast?.className).toContain('flex');
	expect(regularToast?.className).not.toContain('grid-cols-');
	expect(screen.getByRole('button', { name: 'Create account' })).toBeDefined();
});
