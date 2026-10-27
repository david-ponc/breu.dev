// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ magicLink: vi.fn() }));

vi.mock('#/core/lib/auth/client', () => ({
	authClient: { signIn: { magicLink: mocks.magicLink } },
}));

import { MagicLinkSignInForm } from './magic-link-sign-in-form';

describe('MagicLinkSignInForm', () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => cleanup());

	it('shows a success alert and returns to the initial form state', async () => {
		mocks.magicLink.mockResolvedValue({ error: null });
		render(<MagicLinkSignInForm />);

		const input = screen.getByRole('textbox', { name: 'Email address' });
		fireEvent.change(input, { target: { value: 'person@example.com' } });
		fireEvent.submit(input.closest('form') as HTMLFormElement);

		expect((await screen.findByRole('status')).textContent).toContain('Check your inbox');
		expect(screen.queryByRole('textbox', { name: 'Email address' })).toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Use another email' }));

		expect(
			(screen.getByRole('textbox', { name: 'Email address' }) as HTMLInputElement).value,
		).toBe('');
		expect(screen.getByRole('button', { name: 'Continue with email' })).toBeTruthy();
	});

	it('keeps the form available and shows a generic error when sending fails', async () => {
		mocks.magicLink.mockResolvedValue({ error: { message: 'Internal API detail' } });
		render(<MagicLinkSignInForm />);

		const input = screen.getByRole('textbox', { name: 'Email address' });
		fireEvent.change(input, { target: { value: 'person@example.com' } });
		fireEvent.submit(input.closest('form') as HTMLFormElement);

		await waitFor(() =>
			expect(
				screen.getByText(
					"We couldn't send the link. Please check the address and try again.",
				),
			).toBeTruthy(),
		);
		expect(screen.getByRole('textbox', { name: 'Email address' })).toBeTruthy();
		expect(screen.queryByText('Internal API detail')).toBeNull();
	});

	it('shows an expired-link error when redirected from verification', () => {
		render(<MagicLinkSignInForm linkError />);

		expect(screen.getByRole('alert').textContent).toContain(
			'That sign-in link is invalid or expired. Request a new one.',
		);
	});
});
