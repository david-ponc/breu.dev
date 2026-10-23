// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getSlug: vi.fn(),
	getAiSlug: vi.fn(),
	addToast: vi.fn(),
	addAnchoredToast: vi.fn(),
	put: vi.fn(),
}));

vi.mock('#/config/env/client', () => ({
	clientEnv: { VITE_BASE_URL: 'https://breu.dev' },
}));
vi.mock('#/core/lib/http/client', () => ({
	httpClient: () => ({
		brevis: {
			links: Object.assign(() => ({ put: mocks.put }), {
				slugs: {
					get: mocks.getSlug,
					completion: { get: mocks.getAiSlug },
				},
			}),
		},
	}),
}));

vi.mock('#/core/ui/toast', () => ({
	toastManager: { add: mocks.addToast, promise: vi.fn() },
	anchoredToastManager: { add: mocks.addAnchoredToast },
}));

import { CreateLinkForm } from './create-link-form';

function FormHarness() {
	return <CreateLinkForm defaultValues={{ slug: 'existing-slug' }} />;
}

async function mountForm() {
	const root = createRootRoute({ component: FormHarness });
	const router = createRouter({
		routeTree: root,
		history: createMemoryHistory({ initialEntries: ['/'] }),
	});
	const queryClient = new QueryClient();

	await act(async () => {
		await router.load();
		render(
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>,
		);
	});
}

function enterUrl() {
	const [urlInput] = screen.getAllByRole('textbox');
	if (!urlInput) throw new Error('The destination URL input was not rendered.');
	fireEvent.change(urlInput, { target: { value: 'example.com/article' } });
}

describe('CreateLinkForm AI slug suggestion', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.getAiSlug.mockResolvedValue({
			data: { slug: 'ai-suggested-slug', meta: null },
			error: null,
		});
	});
	afterEach(() => cleanup());

	it('suggests a slug from the current valid URL', async () => {
		await mountForm();
		const aiButton = screen.getByRole('button', {
			name: 'Enter a destination URL to generate an AI slug',
		}) as HTMLButtonElement;
		const randomButton = screen.getByRole('button', {
			name: 'Enter a destination URL to generate a random slug',
		}) as HTMLButtonElement;

		expect(aiButton.getAttribute('aria-disabled')).toBe('true');
		expect(randomButton.getAttribute('aria-disabled')).toBe('true');
		fireEvent.click(aiButton);
		fireEvent.click(randomButton);
		expect(mocks.getAiSlug).not.toHaveBeenCalled();
		expect(mocks.getSlug).not.toHaveBeenCalled();
		enterUrl();
		const enabledAiButton = await screen.findByRole('button', {
			name: 'Generate a slug with AI',
		});
		await waitFor(() =>
			expect(enabledAiButton.getAttribute('aria-disabled')).toBe('false'),
		);
		fireEvent.click(enabledAiButton);

		await waitFor(() => {
			expect(mocks.getAiSlug).toHaveBeenCalledWith({
				query: { url: 'https://example.com/article' },
			});
			expect((screen.getAllByRole('textbox')[1] as HTMLInputElement).value).toBe(
				'ai-suggested-slug',
			);
		});
		expect(mocks.addAnchoredToast).toHaveBeenCalledWith({
			title: 'Slug generated successfully',
			positionerProps: { anchor: enabledAiButton, sideOffset: 8 },
		});
	});

	it('shows an anchored success toast after generating a random slug', async () => {
		mocks.getSlug.mockResolvedValue({ data: { slug: 'random-slug' }, error: null });
		await mountForm();
		enterUrl();

		const randomButton = await screen.findByRole('button', {
			name: 'Generate a random slug',
		});
		fireEvent.click(randomButton);

		await waitFor(() => {
			expect((screen.getAllByRole('textbox')[1] as HTMLInputElement).value).toBe(
				'random-slug',
			);
			expect(mocks.addAnchoredToast).toHaveBeenCalledWith({
				title: 'Slug generated successfully',
				positionerProps: { anchor: randomButton, sideOffset: 8 },
			});
		});
	});

	it('shows an error toast when the AI suggestion fails', async () => {
		mocks.getAiSlug.mockResolvedValue({
			data: null,
			error: { value: { message: 'Unavailable' } },
		});
		await mountForm();
		enterUrl();

		const aiButton = await screen.findByRole('button', {
			name: 'Generate a slug with AI',
		});
		await waitFor(() => expect(aiButton.getAttribute('aria-disabled')).toBe('false'));
		fireEvent.click(aiButton);

		await waitFor(() =>
			expect(mocks.addToast).toHaveBeenCalledWith({
				type: 'error',
				title: 'Could not generate an AI slug',
				description: 'Please try again or use the other slug generator.',
			}),
		);
	});

	it('explains why slug generation is unavailable when the URL is empty', async () => {
		await mountForm();
		const aiButton = screen.getByRole('button', {
			name: 'Enter a destination URL to generate an AI slug',
		});
		const randomButton = screen.getByRole('button', {
			name: 'Enter a destination URL to generate a random slug',
		});

		fireEvent.focus(aiButton);

		await waitFor(() =>
			expect(
				screen.getByText('Enter a destination URL to generate an AI slug'),
			).toBeTruthy(),
		);
		expect(document.querySelector('.tooltip-viewport-animated')).toBeTruthy();

		fireEvent.focus(randomButton);

		await waitFor(() =>
			expect(
				screen.getByText('Enter a destination URL to generate a random slug'),
			).toBeTruthy(),
		);
	});
});
