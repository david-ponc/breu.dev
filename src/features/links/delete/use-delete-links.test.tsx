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
	addToast: vi.fn(() => 'delete-toast-id'),
	updateToast: vi.fn(),
	deleteLink: vi.fn(),
	closeDialog: vi.fn(),
	onDeleted: vi.fn(),
}));

vi.mock('#/core/lib/http/client', () => ({
	httpClient: () => ({
		brevis: {
			links: () => ({ delete: mocks.deleteLink }),
		},
	}),
}));

vi.mock('#/core/ui/toast', () => ({
	toastManager: { add: mocks.addToast, update: mocks.updateToast },
}));

import { useDeleteLinks } from './use-delete-links';

function DeleteHarness() {
	const { isPending, deleteLinks } = useDeleteLinks({
		handle: { close: mocks.closeDialog },
		userId: 'user-1',
		onDeleted: mocks.onDeleted,
	});

	return (
		<button
			type='button'
			disabled={isPending}
			onClick={() => deleteLinks([{ id: 'link-1', slug: 'my-link' }])}
		>
			Delete link
		</button>
	);
}

async function mount() {
	const root = createRootRoute({ component: DeleteHarness });
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

describe('useDeleteLinks', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mocks.addToast.mockReturnValue('delete-toast-id');
		mocks.deleteLink.mockResolvedValue({
			data: null,
			error: { value: { code: 'LINK_ANONYMOUS_ACTION_FORBIDDEN' } },
		});
	});
	afterEach(() => cleanup());

	it('updates the loading toast to a single account prompt for guest deletions', async () => {
		await mount();
		fireEvent.click(screen.getByRole('button', { name: 'Delete link' }));

		await waitFor(() => {
			expect(mocks.updateToast).toHaveBeenCalledWith(
				'delete-toast-id',
				expect.objectContaining({
					type: 'info',
					title: 'Create a free account',
					description: 'Sign up to manage and delete your links.',
					data: { layout: 'account-prompt' },
				}),
			);
		});
		expect(mocks.addToast).toHaveBeenCalledTimes(1);
		expect(mocks.updateToast).toHaveBeenCalledTimes(1);
		expect(mocks.closeDialog).not.toHaveBeenCalled();
		expect(mocks.onDeleted).not.toHaveBeenCalled();
	});

	it('shows a readable error for non-restriction failures', async () => {
		mocks.deleteLink.mockResolvedValue({
			data: null,
			error: { value: { message: 'The link could not be found.' } },
		});
		await mount();
		fireEvent.click(screen.getByRole('button', { name: 'Delete link' }));

		await waitFor(() =>
			expect(mocks.updateToast).toHaveBeenCalledWith(
				'delete-toast-id',
				expect.objectContaining({
					type: 'error',
					description: '/my-link could not be deleted. The link could not be found.',
				}),
			),
		);
		expect(mocks.updateToast.mock.calls[0]?.[1]?.description).not.toContain(
			'[object Object]',
		);
	});
});
