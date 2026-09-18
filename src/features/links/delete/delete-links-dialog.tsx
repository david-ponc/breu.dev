import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';
import { Button } from '#/core/ui/button';
import { Dialog } from '#/core/ui/dialog';

import { useDeleteLinks } from './use-delete-links';

interface DeleteLinksDialogProps {
	handle: ReturnType<typeof Dialog.createHandle>;
	selectedLinks: LinkSummary[];
	userId: string;
	onDeleted: () => void;
}

export function DeleteLinksDialog({
	handle,
	selectedLinks,
	userId,
	onDeleted,
}: DeleteLinksDialogProps) {
	const { isPending, deleteLinks } = useDeleteLinks({ handle, userId, onDeleted });
	const selectedCount = selectedLinks.length;

	return (
		<Dialog.Root handle={handle}>
			<Dialog.Popup>
				<Dialog.Header>
					<Dialog.Title>
						Delete {selectedCount === 1 ? 'link' : `${selectedCount} links`}?
					</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. The selected{' '}
						{selectedCount === 1 ? 'link' : 'links'} will be permanently removed and stop
						working immediately.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Panel>
					{selectedCount === 1 ? (
						<p className='font-medium text-foreground'>/{selectedLinks[0].slug}</p>
					) : (
						<ul className='max-h-40 overflow-auto rounded-lg border border-border bg-secondary p-2 text-sm'>
							{selectedLinks.map((link) => (
								<li key={link.id} className='py-0.5'>
									/{link.slug}
								</li>
							))}
						</ul>
					)}
				</Dialog.Panel>
				<Dialog.Footer>
					<Dialog.Close
						render={
							<Button variant='outline' disabled={isPending}>
								Cancel
							</Button>
						}
					/>
					<Button
						variant='destructive'
						loading={isPending}
						onClick={() => deleteLinks(selectedLinks)}
					>
						Delete {selectedCount} {selectedCount === 1 ? 'link' : 'links'}
					</Button>
				</Dialog.Footer>
			</Dialog.Popup>
		</Dialog.Root>
	);
}
