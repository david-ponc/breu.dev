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
	put: vi.fn(),
	add: vi.fn(() => 'edit-toast-id'),
	update: vi.fn(),
	mutateSlug: vi.fn(),
}));

vi.mock('#/core/lib/http/client', () => ({
	httpClient: () => ({ brevis: { links: () => ({ put: mocks.put }) } }),
}));
vi.mock('#/core/ui/toast', () => ({
	toastManager: { add: mocks.add, update: mocks.update },
}));
vi.mock('#/features/links/create/use-slug-generator', () => ({
	useSlugGenerator: () => ({ isPending: false, mutateAsync: mocks.mutateSlug }),
}));

import type { Link } from '#/contexts/brevis/links/domain/link';

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
	const [form] = useEditLinkForm(link);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<button type='submit'>Save changes</button>
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
}

describe('useEditLinkForm', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.add.mockReturnValue('edit-toast-id');
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
				title: 'Keep your link',
				description: 'Create a free account to edit it.',
				data: { layout: 'account-prompt' },
				actionProps: expect.objectContaining({ children: 'Create account' }),
			}),
		);
	});
});
