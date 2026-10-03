import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Badge } from '#/core/ui/badge';
import { Card } from '#/core/ui/card';
import { Empty } from '#/core/ui/empty';

import { getLinkPreviewData } from './preview-data';
import { userLinkQueryOptions } from './query';

interface LinkDetailPreviewProps {
	linkId: string;
	userId: string;
}

export function LinkDetailPreview({ linkId, userId }: LinkDetailPreviewProps) {
	const { data: link } = useSuspenseQuery(userLinkQueryOptions(userId, linkId));
	const { title, description, image, metadata, tags, hasMetadata, hasPreview } =
		getLinkPreviewData(link.meta);

	return (
		<Card.Root className='max-h-144 min-w-0 gap-0 py-0 lg:max-h-88'>
			{hasPreview ? <LinkPreviewImage key={`${linkId}:${image}`} src={image} /> : null}
			<section
				aria-label='Link preview details'
				// biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users need to focus the scrollable preview to read all its content.
				tabIndex={0}
				className='flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-y-contain py-4 -outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring has-data-[slot=card-footer]:pb-0'
			>
				{hasPreview ? (
					<>
						<Card.Header>
							<Card.Title className='wrap-anywhere text-balance'>
								{title || 'No title available'}
							</Card.Title>
							<Card.Description className='wrap-anywhere text-pretty'>
								{description || 'No description available'}
							</Card.Description>
						</Card.Header>
						{hasMetadata ? (
							<Card.Panel>
								<dl className='space-y-3 text-sm'>
									{metadata.map(({ label, value }) => (
										<div key={label}>
											<dt className='text-muted-foreground'>{label}</dt>
											<dd className='wrap-anywhere'>{value}</dd>
										</div>
									))}
									{tags.length ? (
										<div>
											<dt className='text-muted-foreground'>Tags</dt>
											<dd className='mt-1 flex flex-wrap gap-1.5'>
												{tags.map((tag) => (
													<Badge
														key={tag}
														className='wrap-anywhere h-auto whitespace-normal'
													>
														{tag}
													</Badge>
												))}
											</dd>
										</div>
									) : null}
								</dl>
							</Card.Panel>
						) : null}
					</>
				) : (
					<Empty.Root>
						<Empty.Header>
							<Empty.Title>No preview available</Empty.Title>
							<Empty.Description>
								This destination does not provide preview metadata.
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				)}
				{link.comments ? (
					<Card.Footer>
						<p className='wrap-anywhere whitespace-pre-wrap text-muted-foreground text-sm'>
							{link.comments}
						</p>
					</Card.Footer>
				) : null}
			</section>
		</Card.Root>
	);
}

function LinkPreviewImage({ src }: { src: string | null | undefined }) {
	const [imageFailed, setImageFailed] = useState(false);

	if (!src || imageFailed) {
		return (
			<div className='flex aspect-video max-h-48 w-full shrink-0 items-center justify-center bg-muted px-4 text-center text-muted-foreground text-sm'>
				No image available
			</div>
		);
	}

	return (
		<img
			src={src}
			alt=''
			className='aspect-video max-h-48 w-full shrink-0 object-cover'
			onError={() => setImageFailed(true)}
		/>
	);
}
