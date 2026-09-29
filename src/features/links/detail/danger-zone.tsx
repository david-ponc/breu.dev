import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { LINK_STATUS } from '#/contexts/brevis/links/domain/link';
import { httpClient } from '#/core/lib/http/client';
import { Button } from '#/core/ui/button';
import { Card } from '#/core/ui/card';
import { Dialog } from '#/core/ui/dialog';
import { toastManager } from '#/core/ui/toast';
import { DeleteLinksDialog } from '#/features/links/delete/delete-links-dialog';

import { userLinkQueryOptions } from './query';

interface LinkDangerZoneProps {
	linkId: string;
	userId: string;
}

export function LinkDangerZone({ linkId, userId }: LinkDangerZoneProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: link } = useSuspenseQuery(userLinkQueryOptions(userId, linkId));
	const [deleteDialogHandle] = useState(() => Dialog.createHandle());
	const disabled = link.status === LINK_STATUS.Disabled;
	const { isPending, mutate } = useMutation({
		mutationFn: async () => {
			const status = disabled ? LINK_STATUS.Active : LINK_STATUS.Disabled;
			await toastManager.promise(
				httpClient().brevis.links({ id: link.id }).put({
					slug: link.slug,
					url: link.url,
					comments: link.comments,
					meta: link.meta,
					status,
				}),
				{
					loading: {
						title: disabled ? 'Enabling link...' : 'Disabling link...',
					},
					error: (error) => ({
						title: disabled ? 'Failed to enable link' : 'Failed to disable link',
						description:
							error instanceof Error ? error.message : 'An unexpected error occurred.',
					}),
					success: (data) => {
						if (data.error) throw data.error;
						void queryClient.invalidateQueries({ queryKey: ['links'] });
						return {
							title: disabled ? 'Link enabled' : 'Link disabled',
							description: disabled
								? `/${link.slug} is active again.`
								: `/${link.slug} will no longer redirect.`,
						};
					},
				},
			);
		},
	});

	return (
		<>
			<Card.Root>
				<Card.Header>
					<Card.Title>Danger zone</Card.Title>
					<Card.Description>
						Disable the link to stop redirects, or delete it permanently.
					</Card.Description>
				</Card.Header>
				<Card.Panel className='space-y-4'>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
						<div className='min-w-0'>
							<p className='font-medium'>{disabled ? 'Enable link' : 'Disable link'}</p>
							<p className='text-muted-foreground text-sm'>
								{disabled
									? 'Start redirecting visitors to the destination URL again.'
									: 'Visitors will no longer be redirected. You can enable it later.'}
							</p>
						</div>
						<Button
							variant={disabled ? 'outline' : 'destructive-outline'}
							className='shrink-0'
							loading={isPending}
							onClick={() => mutate()}
						>
							{disabled ? 'Enable' : 'Disable'}
						</Button>
					</div>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
						<div className='min-w-0'>
							<p className='font-medium'>Delete link</p>
							<p className='text-muted-foreground text-sm'>
								This cannot be undone. The short URL will stop working immediately.
							</p>
						</div>
						<Dialog.Trigger
							handle={deleteDialogHandle}
							render={<Button variant='destructive' className='shrink-0' />}
						>
							Delete
						</Dialog.Trigger>
					</div>
				</Card.Panel>
			</Card.Root>
			<DeleteLinksDialog
				handle={deleteDialogHandle}
				selectedLinks={[link]}
				userId={userId}
				onDeleted={() => {
					void navigate({ to: '/dashboard/links' });
				}}
			/>
		</>
	);
}
