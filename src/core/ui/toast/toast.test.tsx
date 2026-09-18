// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
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
	const icon = document.querySelector('[data-slot="toast-icon"]');
	expect(icon?.querySelector('[data-spinner]')).not.toBeNull();
	for (let progress = 1; progress <= 3; progress++) {
		act(() =>
			toastManager.update(id, { type: 'loading', description: `${progress} of 3` }),
		);
		expect(document.querySelector('[data-slot="toast-icon"]')).toBe(icon);
	}
	act(() => toastManager.update(id, { type: 'success', title: 'Links deleted' }));
	expect(document.querySelector('[data-slot="toast-icon"]')).not.toBe(icon);
	expect(document.querySelector('[data-slot="toast-icon"] [data-spinner]')).toBeNull();
});
