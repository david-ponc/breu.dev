import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { startTransition, useMemo, useState, ViewTransition } from 'react';

import { Icon } from '#/core/icons/icon';
import { Button } from '#/core/ui/button';
import { Dialog } from '#/core/ui/dialog';
import { DeleteLinksDialog } from '#/features/links/delete/delete-links-dialog';
import { LinkTable } from '#/features/links/table/link-table';
import { userLinksQueryOptions } from '#/features/links/table/query';

export const Route = createFileRoute('/dashboard/links/')({
	component: Page,
});

function Page() {
	const { session } = Route.useRouteContext();
	const userId = session.user.id;
	const { data: links } = useQuery(userLinksQueryOptions(userId));
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const [deleteDialogHandle] = useState(() => Dialog.createHandle());

	const selectedLinks = useMemo(
		() => links?.filter((link) => rowSelection[link.id]) ?? [],
		[links, rowSelection],
	);
	const selectedCount = selectedLinks.length;

	// Keep checkbox state and button visibility in the same transition commit.
	const handleRowSelectionChange = (selection: Record<string, boolean>) => {
		startTransition(() => setRowSelection(selection));
	};

	return (
		<div className='flex min-w-0 flex-col gap-6'>
			<header className='flex items-end justify-between gap-4'>
				<div>
					<h1 className='font-semibold text-xl'>Links</h1>
					<p className='text-base text-muted-foreground'>Track and manage your links</p>
				</div>
				<menu className='flex items-center gap-2'>
					{selectedCount > 0 && (
						<ViewTransition
							default='none'
							enter='links-delete-enter'
							exit='links-delete-exit'
						>
							<Dialog.Trigger
								handle={deleteDialogHandle}
								render={<Button variant='destructive' />}
							>
								Delete {selectedCount} {selectedCount === 1 ? 'link' : 'links'}
							</Dialog.Trigger>
						</ViewTransition>
					)}
					<Button render={<Link to='/dashboard/links/new' />}>
						Create Link
						<Icon name='link' data-icon='inline-end' />
					</Button>
				</menu>
			</header>

			<DeleteLinksDialog
				handle={deleteDialogHandle}
				selectedLinks={selectedLinks}
				userId={userId}
				onDeleted={() => handleRowSelectionChange({})}
			/>

			<LinkTable
				userId={userId}
				rowSelection={rowSelection}
				onRowSelectionChange={handleRowSelectionChange}
			/>
		</div>
	);
}
