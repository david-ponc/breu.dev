// @vitest-environment jsdom

import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from '@tanstack/react-router';
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	signIn: vi.fn(),
	slug: vi.fn(),
	create: vi.fn(),
	toast: vi.fn(),
	anchoredToast: vi.fn(),
	copy: vi.fn(),
}));

vi.mock('#/config/env/client', () => ({
	clientEnv: { VITE_BASE_URL: 'https://breu.dev' },
}));
vi.mock('#/core/lib/auth/client', () => ({
	authClient: { getSession: mocks.getSession, signIn: { anonymous: mocks.signIn } },
}));
vi.mock('#/core/lib/http/client', () => ({
	httpClient: () => ({
		brevis: {
			links: Object.assign(() => ({ put: mocks.create }), {
				slugs: { get: mocks.slug },
			}),
		},
	}),
}));
vi.mock('#/core/ui/toast', () => ({
	toastManager: { add: mocks.toast },
	anchoredToastManager: { add: mocks.anchoredToast },
}));

import { LandingPage } from '../../landing-page';
import { QuickLinkForm } from './quick-link-form';

const linkResponse = {
	data: { slug: 'brave-fox', url: 'https://example.com/launch' },
	error: null,
};
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

async function mount(landing = false) {
	const root = createRootRoute({ component: Outlet });
	const index = createRoute({
		getParentRoute: () => root,
		path: '/',
		component: landing ? LandingPage : QuickLinkForm,
	});
	const detail = createRoute({
		getParentRoute: () => root,
		path: '/dashboard/links/$linkId',
		component: () => <p>Link details page</p>,
	});
	const signIn = createRoute({
		getParentRoute: () => root,
		path: '/auth/sign-in',
		component: () => <p>Sign in page</p>,
	});
	const router = createRouter({
		routeTree: root.addChildren([index, detail, signIn]),
		history: createMemoryHistory({ initialEntries: ['/'] }),
		defaultPendingMinMs: 0,
	});
	await act(async () => {
		await router.load();
		render(<RouterProvider router={router} />);
	});
	return screen.findByRole<HTMLInputElement>('textbox', { name: 'Destination URL' });
}

function submit(input: HTMLInputElement, value = 'example.com/launch') {
	fireEvent.change(input, { target: { value } });
	fireEvent.submit(input.form as HTMLFormElement);
}

describe('QuickLinkForm', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
		mocks.getSession.mockResolvedValue({ data: null });
		mocks.signIn.mockResolvedValue({ error: null });
		mocks.slug.mockResolvedValue({ data: { slug: 'brave-fox' }, error: null });
		mocks.create.mockResolvedValue(linkResponse);
		mocks.copy.mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: mocks.copy },
		});
	});
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});
	afterAll(() => {
		if (clipboardDescriptor)
			Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
		else Reflect.deleteProperty(navigator, 'clipboard');
	});

	it('renders the landing and sample data without signing in or fetching links', async () => {
		const input = await mount(true);
		expect(screen.getAllByRole('main')).toHaveLength(1);
		expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
			'Short links. Clear insights.',
		);
		expect(screen.getByText(/Product preview/).textContent).toContain('Example data');
		expect(
			screen.getByRole('img', { name: /Example activity: 1,000 clicks/ }),
		).toBeDefined();
		expect(screen.getByRole('link', { name: 'Open app' }).getAttribute('href')).toBe(
			'/dashboard/links',
		);
		expect(document.activeElement).not.toBe(input);
		expect(mocks.getSession).not.toHaveBeenCalled();
		expect(mocks.slug).not.toHaveBeenCalled();
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('associates validation with the field and focuses it, including repeated failures', async () => {
		const input = await mount();
		submit(input, 'not a url');
		const error = await screen.findByRole('alert');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toContain(error.id);
		await waitFor(() => expect(document.activeElement).toBe(input));
		screen.getByRole('button', { name: 'Create link' }).focus();
		fireEvent.submit(input.form as HTMLFormElement);
		await waitFor(() => expect(document.activeElement).toBe(input));
		expect(mocks.getSession).not.toHaveBeenCalled();
	});

	it('explains the guest limit and links to registration from the informational footer', async () => {
		await mount();
		const note = screen.getByRole('note', { name: 'One link without an account' });
		expect(note.textContent).toContain('Guests can create one link.');
		expect(note.textContent).toContain('to get full access to the platform.');
		const registration = within(note).getByRole('link', { name: 'Create an account' });
		expect(registration.getAttribute('href')).toBe('/auth/sign-in');
		expect(screen.getAllByRole('link')).toHaveLength(1);
		fireEvent.click(registration);
		expect(await screen.findByText('Sign in page')).toBeDefined();
	});

	it('shows pending content, preserves the card, and avoids duplicate creation', async () => {
		let finish!: (response: typeof linkResponse) => void;
		mocks.create.mockReturnValue(
			new Promise((resolve) => {
				finish = resolve;
			}),
		);
		const input = await mount();
		const form = input.form as HTMLFormElement;
		const card = input.closest('[data-slot="card"]');
		const liveRegion = screen.getByRole('status');
		submit(input);
		await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
		const pending = await screen.findByRole('heading', { name: 'Crafting your link…' });
		expect(pending.closest('[data-slot="card"]')).toBe(card);
		expect(screen.getByRole('status')).toBe(liveRegion);
		expect(form.hasAttribute('inert')).toBe(true);
		expect(form.getAttribute('aria-hidden')).toBe('true');
		expect(screen.queryByRole('textbox')).toBeNull();
		expect(screen.queryByRole('note')).toBeNull();
		expect(screen.queryByRole('button', { name: 'Create link' })).toBeNull();
		expect(screen.getByRole('status').textContent).toContain('Crafting your link');
		fireEvent.submit(form);
		expect(mocks.create).toHaveBeenCalledTimes(1);
		await act(async () => finish(linkResponse));
		const success = await screen.findByRole('heading', { name: 'Your link is live' });
		expect(success.closest('[data-slot="card"]')).toBe(card);
		expect(screen.getByRole('status')).toBe(liveRegion);
		expect(screen.queryByRole('heading', { name: 'Crafting your link…' })).toBeNull();
	});

	it('normalizes a pasted URL, focuses copy, and copies the actual short URL', async () => {
		const input = await mount();
		submit(input, ' https://example.com/launch ');
		const copy = await screen.findByRole('button', { name: 'Copy short link' });
		expect(mocks.create).toHaveBeenCalledWith(
			expect.objectContaining({ url: 'https://example.com/launch', slug: 'brave-fox' }),
		);
		await waitFor(() => expect(document.activeElement).toBe(copy));
		const shortLink = screen.getByRole<HTMLInputElement>('textbox', {
			name: 'Short link',
		});
		expect(shortLink.readOnly).toBe(true);
		expect(shortLink.value).toBe('https://breu.dev/r/brave-fox');
		fireEvent.click(copy);
		await waitFor(() =>
			expect(mocks.copy).toHaveBeenCalledWith('https://breu.dev/r/brave-fox'),
		);
		expect(mocks.anchoredToast).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Copied to clipboard' }),
		);
		expect(screen.getByRole('status').textContent).toContain('Your link is live');
	});

	it('keeps the URL available when clipboard access fails', async () => {
		mocks.copy.mockRejectedValue(new Error('Clipboard denied'));
		const input = await mount();
		submit(input);
		fireEvent.click(await screen.findByRole('button', { name: 'Copy short link' }));
		await waitFor(() =>
			expect(mocks.toast).toHaveBeenCalledWith({
				type: 'error',
				title: 'Unable to copy link',
			}),
		);
		const shortLink = screen.getByRole<HTMLInputElement>('textbox', {
			name: 'Short link',
		});
		expect(shortLink.value).toBe('https://breu.dev/r/brave-fox');
		act(() => shortLink.focus());
		expect(document.activeElement).toBe(shortLink);
		expect(shortLink.selectionStart).toBe(0);
		expect(shortLink.selectionEnd).toBe(shortLink.value.length);
	});

	it('navigates to the created link details', async () => {
		const input = await mount();
		submit(input);
		const details = await screen.findByRole('link', { name: 'View details' });
		expect(details.getAttribute('href')).toMatch(/^\/dashboard\/links\/[\w-]+$/);
		fireEvent.click(details);
		expect(await screen.findByText('Link details page')).toBeDefined();
	});

	it('replaces the whole card content while preserving its root and live region', async () => {
		const input = await mount();
		const card = input.closest('[data-slot="card"]');
		const liveRegion = screen.getByRole('status');
		submit(input);
		const heading = await screen.findByRole('heading', { name: 'Your link is live' });
		expect(heading.closest('[data-slot="card"]')).toBe(card);
		expect(screen.getByRole('status')).toBe(liveRegion);
		expect(screen.queryByText('Create a new link')).toBeNull();
		expect(
			screen.queryByText(
				'Create a new link to redirect your users to any destination URL.',
			),
		).toBeNull();
		expect(screen.queryByRole('form')).toBeNull();
		expect(screen.queryByRole('textbox', { name: 'Destination URL' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Shorten another' })).toBeNull();
		expect(screen.queryByRole('note')).toBeNull();
		expect(screen.queryByRole('link', { name: 'Create an account' })).toBeNull();
		expect(screen.getAllByRole('link')).toHaveLength(1);
		expect(screen.getByRole('link', { name: 'View details' })).toBeDefined();
	});

	it('returns to the field with its value intact when creation fails', async () => {
		let fail!: (cause: Error) => void;
		mocks.create.mockReturnValue(
			new Promise((_, reject) => {
				fail = reject;
			}),
		);
		const input = await mount();
		submit(input);
		await screen.findByRole('heading', { name: 'Crafting your link…' });
		await act(async () => fail(new Error('Network unavailable')));
		await waitFor(() =>
			expect(mocks.toast).toHaveBeenCalledWith(
				expect.objectContaining({ type: 'error' }),
			),
		);
		await waitFor(() => expect(document.activeElement).toBe(input));
		expect(input.value).toBe('example.com/launch');
		expect(input.form?.hasAttribute('inert')).toBe(false);
		expect(screen.queryByRole('heading', { name: 'Crafting your link…' })).toBeNull();
		expect(
			screen.getByRole('note', { name: 'One link without an account' }),
		).toBeDefined();
	});

	it('shows the rate limit error inline and focuses the field', async () => {
		mocks.signIn.mockResolvedValue({ error: { status: 429 } });
		const input = await mount();
		submit(input);
		expect((await screen.findByRole('alert')).textContent).toContain('too many links');
		await waitFor(() => expect(document.activeElement).toBe(input));
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('preserves the guest limit and the action to create an account', async () => {
		mocks.create.mockResolvedValue({
			error: { value: { code: 'LINK_ANONYMOUS_ACTION_FORBIDDEN' } },
		});
		const input = await mount();
		submit(input);
		await waitFor(() =>
			expect(mocks.toast).toHaveBeenCalledWith(
				expect.objectContaining({ title: 'Create a free account' }),
			),
		);
		expect(screen.queryByRole('heading', { name: 'Your link is live' })).toBeNull();
		await waitFor(() => expect(document.activeElement).toBe(input));
		await act(async () => mocks.toast.mock.calls[0][0].actionProps.onClick());
		expect(await screen.findByText('Sign in page')).toBeDefined();
	});
});
