import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useRef, useState } from 'react';

import { clientEnv } from '#/config/env/client';
import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { shortLinkPath, stripHttpProtocol } from '#/core/lib/url';
import { Button } from '#/core/ui/button';
import { anchoredToastManager, toastManager } from '#/core/ui/toast';
import { StatusColumn } from '#/features/links/table/columns/status-column';

import { formatDate } from './format';
import { userLinkQueryOptions } from './query';

interface LinkDetailHeaderProps {
	linkId: string;
	userId: string;
}

export function LinkDetailHeader({ linkId, userId }: LinkDetailHeaderProps) {
	const { data: link } = useSuspenseQuery(userLinkQueryOptions(userId, linkId));
	const shortHref = shortLinkPath(link.slug);
	const copyButtonRef = useRef<HTMLButtonElement>(null);
	const [copied, setCopied] = useState(false);

	const copyShortUrl = async () => {
		try {
			await navigator.clipboard.writeText(
				new URL(shortHref, clientEnv.VITE_BASE_URL).href,
			);
			setCopied(true);
			anchoredToastManager.add({
				title: 'Copied to clipboard',
				positionerProps: {
					anchor: copyButtonRef.current,
					sideOffset: 8,
				},
				onClose: () => setCopied(false),
			});
		} catch {
			toastManager.add({ type: 'error', title: 'Unable to copy link' });
		}
	};

	return (
		<header className='flex flex-col gap-4'>
			<Button variant='outline' className='w-fit' render={<Link to='/dashboard/links' />}>
				<Icon name='chevron-left' data-icon='inline-start' />
				Back
			</Button>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div className='min-w-0'>
					<div className='flex flex-wrap items-center gap-2'>
						<h1 className='font-semibold text-xl'>/r/{link.slug}</h1>
						<StatusColumn status={link.status} />
					</div>
					<p className='mt-1 flex min-w-0 items-center gap-2 text-muted-foreground'>
						<Icon name='arrow-right' className='size-3.5 shrink-0' />
						<a
							href={link.url}
							target='_blank'
							rel='noopener noreferrer'
							title={link.url}
							className='min-w-0 truncate underline decoration-dotted underline-offset-2'
						>
							{stripHttpProtocol(link.url)}
						</a>
					</p>
					<p className='mt-1 text-muted-foreground text-sm'>
						Created {formatDate(link.createdAt)}
						{link.updatedAt !== link.createdAt
							? ` · Updated ${formatDate(link.updatedAt)}`
							: null}
					</p>
				</div>
				<menu className='flex flex-wrap items-center gap-2'>
					<Button
						ref={copyButtonRef}
						variant='outline'
						onClick={() => void copyShortUrl()}
					>
						Copy link
						<span
							data-icon='inline-end'
							className='grid size-4 shrink-0 place-items-center'
						>
							<Icon
								name='clipboard'
								aria-hidden
								className={cn(
									'col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none',
									copied
										? 'scale-75 opacity-0 blur-[2px]'
										: 'scale-100 opacity-100 blur-[0px]',
								)}
							/>
							<Icon
								name='check'
								aria-hidden
								className={cn(
									'col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none',
									copied
										? 'scale-100 opacity-100 blur-[0px]'
										: 'scale-75 opacity-0 blur-[2px]',
								)}
							/>
						</span>
					</Button>
				</menu>
			</div>
		</header>
	);
}
