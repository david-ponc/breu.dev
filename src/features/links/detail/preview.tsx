import { useState } from 'react';

import type { Meta } from '#/contexts/brevis/links/domain/link';
import { cn } from '#/core/lib/cn';
import { Badge } from '#/core/ui/badge';
import { Card } from '#/core/ui/card';
import { Empty } from '#/core/ui/empty';

import { getLinkPreviewData } from './preview-data';

interface LinkPreviewProps {
	meta: Meta | null;
	comments?: string | null;
}

export function LinkPreview({ meta, comments }: LinkPreviewProps) {
	const preview = getLinkPreviewData(meta);
	const og = preview.openGraph;
	const image = og?.image ?? null;
	const title = preview.title;
	const description = preview.description;
	const metadata = [
		{ label: 'Author', value: preview.author },
		{ label: 'Site', value: og?.siteName },
		{ label: 'Type', value: og?.type },
		{ label: 'Locale', value: og?.locale },
		{ label: 'Section', value: og?.section },
		{ label: 'Published', value: og?.publishedTime },
		{ label: 'Modified', value: og?.modifiedTime },
	].flatMap(({ label, value }) => (value ? [{ label, value }] : []));
	const tags = og?.tags ?? [];
	const hasMetadata = metadata.length > 0 || tags.length > 0;
	const hasPreview = Boolean(title || description || image || hasMetadata);

	return (
		<Card.Root className='group/preview relative isolate max-h-144 min-w-0 gap-0 py-0 has-data-[slot=preview-backdrop]:h-120 lg:max-h-88'>
			<LinkPreviewBackdrop src={image} />
			<section
				aria-label='Link preview details'
				// biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users need to focus the scrollable preview to read all its content.
				tabIndex={0}
				className={cn(
					'relative min-h-0 overflow-y-auto overscroll-y-contain py-4 -outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring has-data-[slot=card-footer]:pb-0',
					'scroll-fade-y scroll-fade-6 forced-colors:scroll-fade-none [--scroll-fade-reveal:24px]',
					'group-has-data-[slot=preview-backdrop]/preview:mt-auto group-has-data-[slot=preview-backdrop]/preview:max-h-[65%] group-has-data-[slot=preview-backdrop]/preview:shrink-0',
					'group-has-data-[slot=preview-backdrop]/preview:text-white group-has-data-[slot=preview-backdrop]/preview:mix-blend-difference group-has-data-[slot=preview-backdrop]/preview:forced-colors:text-[CanvasText] group-has-data-[slot=preview-backdrop]/preview:forced-colors:mix-blend-normal',
				)}
			>
				<div className='flex flex-col gap-4'>
					{hasPreview ? (
						<>
							<Card.Header>
								<Card.Title className='wrap-anywhere text-balance'>
									{title || 'No title available'}
								</Card.Title>
								<Card.Description className='wrap-anywhere text-pretty group-has-data-[slot=preview-backdrop]/preview:text-inherit'>
									{description || 'No description available'}
								</Card.Description>
							</Card.Header>
							{hasMetadata ? (
								<Card.Panel>
									<dl className='space-y-3 text-sm'>
										{metadata.map(({ label, value }) => (
											<div key={label}>
												<dt className='text-muted-foreground group-has-data-[slot=preview-backdrop]/preview:text-inherit'>
													{label}
												</dt>
												<dd className='wrap-anywhere'>{value}</dd>
											</div>
										))}
										{tags.length ? (
											<div>
												<dt className='text-muted-foreground group-has-data-[slot=preview-backdrop]/preview:text-inherit'>
													Tags
												</dt>
												<dd className='mt-1 flex flex-wrap gap-1.5'>
													{tags.map((tag) => (
														<Badge
															key={tag}
															className='wrap-anywhere h-auto whitespace-normal group-has-data-[slot=preview-backdrop]/preview:inset-shadow-none group-has-data-[slot=preview-backdrop]/preview:border-white/25 group-has-data-[slot=preview-backdrop]/preview:bg-transparent group-has-data-[slot=preview-backdrop]/preview:text-inherit group-has-data-[slot=preview-backdrop]/preview:shadow-none'
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
						<Empty.Root className='py-8 md:py-8'>
							<Empty.Header>
								<Empty.Title>No preview available</Empty.Title>
								<Empty.Description className='text-inherit'>
									This destination does not provide preview metadata.
								</Empty.Description>
							</Empty.Header>
						</Empty.Root>
					)}
					{comments ? (
						<Card.Footer className='group-has-data-[slot=preview-backdrop]/preview:border-white/20 group-has-data-[slot=preview-backdrop]/preview:bg-transparent'>
							<p className='wrap-anywhere whitespace-pre-wrap text-muted-foreground text-sm group-has-data-[slot=preview-backdrop]/preview:text-inherit'>
								{comments}
							</p>
						</Card.Footer>
					) : null}
				</div>
			</section>
		</Card.Root>
	);
}
function LinkPreviewBackdrop({ src }: { src: string | null | undefined }) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const imageSrc = src?.trim();
	const hasImage = Boolean(imageSrc && imageSrc !== failedSrc);

	return (
		<div
			aria-hidden='true'
			data-slot='preview-backdrop'
			data-fallback={hasImage ? undefined : ''}
			className={cn(
				'pointer-events-none absolute inset-0 overflow-hidden forced-colors:hidden',
				!hasImage && 'bg-preview-canvas',
			)}
		>
			{hasImage ? (
				<img
					src={imageSrc}
					alt=''
					className='absolute inset-0 size-full object-cover'
					onError={() => setFailedSrc(imageSrc ?? null)}
				/>
			) : (
				FALLBACK_BACKDROP.map((className) => (
					<span key={className} className={cn('absolute inset-0', className)} />
				))
			)}
			{BLUR_LAYERS.map((className) => (
				<span
					key={className}
					className={cn('pointer-events-none absolute inset-0', className)}
				/>
			))}
		</div>
	);
}

const FALLBACK_BACKDROP = [
	'bg-[radial-gradient(120%_85%_at_0%_0%,color-mix(in_oklab,var(--color-preview-aurora-sky)_78%,transparent),transparent_62%)]',
	'bg-[radial-gradient(95%_120%_at_50%_-10%,color-mix(in_oklab,var(--color-preview-aurora-violet)_75%,transparent),transparent_66%)]',
	'bg-[radial-gradient(85%_105%_at_100%_35%,color-mix(in_oklab,var(--color-preview-aurora-rose)_72%,transparent),transparent_62%)]',
	'bg-[radial-gradient(95%_85%_at_88%_100%,color-mix(in_oklab,var(--color-preview-aurora-peach)_68%,transparent),transparent_60%)]',
	'bg-[radial-gradient(circle_at_50%_-18%,var(--color-preview-sheen),transparent_56%)]',
	'bg-[radial-gradient(circle_at_50%_-18%,transparent_calc(45%_-_0.5px),var(--color-preview-ring)_45%,transparent_calc(45%_+_0.6px),transparent_calc(57%_-_0.5px),var(--color-preview-ring)_57%,transparent_calc(57%_+_0.6px),transparent_100%)]',
];

const BLUR_LAYERS = [
	'mask-[linear-gradient(to_bottom,transparent_15%,black_25%)] backdrop-blur-[1px]',
	'mask-[linear-gradient(to_bottom,transparent_20%,black_30%)] backdrop-blur-[4px]',
	'mask-[linear-gradient(to_bottom,transparent_25%,black_40%)] backdrop-blur-[8px]',
	'mask-[linear-gradient(to_bottom,transparent_30%,black_50%)] backdrop-blur-[16px]',
	'mask-[linear-gradient(to_bottom,transparent_35%,black_80%)] backdrop-blur-[32px]',
];
