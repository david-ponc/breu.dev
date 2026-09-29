import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Card } from '#/core/ui/card';

import { userLinkQueryOptions } from './query';

interface LinkDetailPreviewProps {
	linkId: string;
	userId: string;
}

export function LinkDetailPreview({ linkId, userId }: LinkDetailPreviewProps) {
	const { data: link } = useSuspenseQuery(userLinkQueryOptions(userId, linkId));
	const [imageFailed, setImageFailed] = useState(false);
	const og = link.meta?.openGraph;
	const title = og?.title || link.meta?.title;
	const description = og?.description || link.meta?.description;
	const image = imageFailed ? null : og?.image;
	const hasPreview = Boolean(title || description || image);

	return (
		<Card.Root className='h-full'>
			{image ? (
				<img
					src={image}
					alt=''
					className='aspect-video w-full object-cover'
					onError={() => setImageFailed(true)}
				/>
			) : null}
			<Card.Header>
				<Card.Title>{title || 'No preview'}</Card.Title>
				<Card.Description>
					{hasPreview
						? description
						: 'Metadata could not be collected for this destination.'}
				</Card.Description>
			</Card.Header>
			{link.comments ? (
				<Card.Footer>
					<p className='whitespace-pre-wrap text-muted-foreground text-sm'>
						{link.comments}
					</p>
				</Card.Footer>
			) : null}
		</Card.Root>
	);
}
