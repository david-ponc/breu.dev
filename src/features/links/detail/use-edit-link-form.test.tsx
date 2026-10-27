// @vitest-environment jsdom

import { useStore } from '@tanstack/react-form';
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
	put: vi.fn(),
	add: vi.fn(() => 'edit-toast-id'),
	update: vi.fn(),
	mutateSlug: vi.fn(),
	mutateAiSlug: vi.fn(),
}));

vi.mock('#/core/lib/http/client', () => ({
	httpClient: () => ({ brevis: { links: () => ({ put: mocks.put }) } }),
}));
vi.mock('#/core/ui/toast', () => ({
	toastManager: { add: mocks.add, update: mocks.update },
}));
vi.mock('#/features/links/create/use-slug-generator', () => ({
	useSlugGenerator: () => ({ isPending: false, mutateAsync: mocks.mutateSlug }),
	useAiSlugGenerator: () => ({ isPending: false, mutateAsync: mocks.mutateAiSlug }),
}));

import type { Link } from '#/contexts/brevis/links/domain/link';
import { CreateLinkValuesSchema } from '#/features/links/create/schema';

import { userLinkQueryKey } from './query';
import { useEditLinkForm } from './use-edit-link-form';

const link = {
	id: '0197fdf0-9e42-7d00-8000-000000000001',
	userId: '0197fdf0-9e42-7d00-8000-000000000002',
	slug: 'my-link',
	url: 'https://example.com',
	comments: '',
	meta: null,
	status: 'active',
	createdAt: '2025-01-01T00:00:00.000Z',
	updatedAt: '2025-01-01T00:00:00.000Z',
} as Link;

function EditFormHarness() {
	const [form, { withValidUrl }, { generateAiSlug }] = useEditLinkForm(link);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppField
				name='url'
				validators={{ onChange: CreateLinkValuesSchema.shape.url }}
			>
				{(field) => (
					<input
						aria-label='Destination URL'
						value={field.state.value}
						onChange={(event) => field.handleChange(event.target.value)}
					/>
				)}
			</form.AppField>
			<form.AppField name='slug'>
				{(field) => (
					<input
						aria-label='Slug'
						value={field.state.value}
						onChange={(event) => field.handleChange(event.target.value)}
					/>
				)}
			</form.AppField>
			<button type='button' onClick={() => void generateAiSlug()}>
				Generate AI slug ({String(withValidUrl)})
			</button>
			<button type='submit' disabled={isSubmitting}>
				Save changes
			</button>
		</form>
	);
}

async function mount() {
	const root = createRootRoute({ component: EditFormHarness });
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
	return { router, queryClient };
}

describe('useEditLinkForm', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.add.mockReturnValue('edit-toast-id');
		mocks.mutateAiSlug.mockResolvedValue({ slug: 'ai-suggested-slug' });
		mocks.put.mockResolvedValue({
			data: null,
			error: { value: { code: 'LINK_ANONYMOUS_ACTION_FORBIDDEN' } },
		});
	});
	afterEach(() => cleanup());

	it('updates the saving toast into a single account prompt for guest edits', async () => {
		await mount();
		const form = screen.getByRole('button', { name: 'Save changes' }).closest('form');
		if (!form) throw new Error('The edit form was not rendered.');
		fireEvent.submit(form);

		await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
		expect(mocks.add).toHaveBeenCalledTimes(1);
		expect(mocks.add).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'loading', title: 'Saving changes...' }),
		);
		expect(mocks.update).toHaveBeenCalledWith(
			'edit-toast-id',
			expect.objectContaining({
				type: 'info',
				title: 'Create a free account',
				description: 'Sign up to keep and edit your link.',
				data: { layout: 'account-prompt' },
				actionProps: expect.objectContaining({ children: 'Create account' }),
			}),
		);
	});

	it('refreshes route data and link cache after saving', async () => {
		const updatedLink = { ...link, slug: 'updated-link' };
		mocks.put.mockResolvedValue({ data: updatedLink, error: null });
		const { router, queryClient } = await mount();
		const invalidateRouter = vi
			.spyOn(router, 'invalidate')
			.mockImplementation(() => new Promise<void>(() => {}));

		const slugInput = screen.getByRole('textbox', { name: 'Slug' });
		fireEvent.change(slugInput, { target: { value: updatedLink.slug } });
		const form = screen.getByRole('button', { name: 'Save changes' }).closest('form');
		if (!form) throw new Error('The edit form was not rendered.');
		fireEvent.submit(form);

		await waitFor(() => {
			expect(invalidateRouter).toHaveBeenCalledOnce();
			expect(mocks.update).toHaveBeenLastCalledWith(
				'edit-toast-id',
				expect.objectContaining({
					type: 'success',
					title: 'Link updated',
					description: '/updated-link has been saved.',
					timeout: 4000,
				}),
			);
			expect(
				(screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement)
					.disabled,
			).toBe(false);
		});
		const invalidateOptions = invalidateRouter.mock.calls[0]?.[0];
		expect(invalidateOptions?.sync).toBeUndefined();
		expect(
			invalidateOptions?.filter?.({ routeId: '/dashboard/links/$linkId' } as never),
		).toBe(true);
		expect(invalidateOptions?.filter?.({ routeId: '/dashboard' } as never)).toBe(false);
		expect(queryClient.getQueryData(userLinkQueryKey(link.userId, link.id))).toEqual(
			updatedLink,
		);
	});

	it('generates an AI slug from the current valid URL', async () => {
		await mount();
		const urlInput = screen.getByRole('textbox', { name: 'Destination URL' });
		fireEvent.change(urlInput, { target: { value: 'https://example.com/article' } });

		fireEvent.click(screen.getByRole('button', { name: 'Generate AI slug (true)' }));

		await waitFor(() => {
			expect(mocks.mutateAiSlug).toHaveBeenCalledWith('https://example.com/article');
			expect(
				(screen.getByRole('textbox', { name: 'Slug' }) as HTMLInputElement).value,
			).toBe('ai-suggested-slug');
		});
	});

	it('does not generate an AI slug when the URL is invalid', async () => {
		await mount();
		const urlInput = screen.getByRole('textbox', { name: 'Destination URL' });
		fireEvent.change(urlInput, { target: { value: 'not-a-url' } });

		fireEvent.click(screen.getByRole('button', { name: 'Generate AI slug (false)' }));

		expect(mocks.mutateAiSlug).not.toHaveBeenCalled();
	});

	it('shows an error toast when AI slug generation fails', async () => {
		mocks.mutateAiSlug.mockRejectedValue(new Error('Unavailable'));
		await mount();
		const urlInput = screen.getByRole('textbox', { name: 'Destination URL' });
		fireEvent.change(urlInput, { target: { value: 'https://example.com/article' } });

		fireEvent.click(screen.getByRole('button', { name: 'Generate AI slug (true)' }));

		await waitFor(() =>
			expect(mocks.add).toHaveBeenCalledWith({
				type: 'error',
				title: 'Could not generate an AI slug',
				description: 'Please try again or use the other slug generator.',
			}),
		);
	});

	it('prompts guests to create an account when AI slug generation is restricted', async () => {
		mocks.mutateAiSlug.mockRejectedValue({
			code: 'LINK_ANONYMOUS_ACTION_FORBIDDEN',
		});
		await mount();
		const urlInput = screen.getByRole('textbox', { name: 'Destination URL' });
		fireEvent.change(urlInput, { target: { value: 'https://example.com/article' } });

		fireEvent.click(screen.getByRole('button', { name: 'Generate AI slug (true)' }));

		await waitFor(() =>
			expect(mocks.add).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'info',
					title: 'Create a free account',
					description: 'Sign up to generate AI slug suggestions.',
					data: { layout: 'account-prompt' },
					actionProps: expect.objectContaining({ children: 'Create account' }),
				}),
			),
		);
		expect(mocks.add).toHaveBeenCalledTimes(1);
	});
});
