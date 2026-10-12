import { Link } from '@tanstack/react-router';
import { useRef, useState } from 'react';

import { clientEnv } from '#/config/env/client';
import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { shortLinkPath, stripHttpProtocol } from '#/core/lib/url';
import { Button } from '#/core/ui/button';
import { Card } from '#/core/ui/card';
import { InputGroup } from '#/core/ui/input-group';
import { anchoredToastManager, toastManager } from '#/core/ui/toast';

import type { CreatedQuickLink } from './use-quick-link';

interface QuickLinkSuccessProps {
	created: CreatedQuickLink;
}

export function QuickLinkSuccess({ created }: QuickLinkSuccessProps) {
	const host = stripHttpProtocol(created.url).split('/')[0] || created.url;
	const shortUrl = new URL(shortLinkPath(created.slug), clientEnv.VITE_BASE_URL).href;

	return (
		<>
			<Card.Header>
				<h2 className='flex items-center gap-2 font-medium text-lg tracking-tight'>
					<Icon name='check' aria-hidden className='size-4 text-success-foreground' />
					Your link is live
				</h2>
				<Card.Description className='wrap-anywhere text-pretty leading-relaxed'>
					Redirects to {host}. Share it anywhere.
				</Card.Description>
			</Card.Header>
			<Card.Panel className='flex-1'>
				<InputGroup.Root>
					<InputGroup.Input
						readOnly
						aria-label='Short link'
						value={shortUrl}
						title={shortUrl}
						className='font-mono'
						onFocus={(event) => event.currentTarget.select()}
					/>
					<InputGroup.Addon align='inline-end'>
						<CopyShortLinkButton shortUrl={shortUrl} />
					</InputGroup.Addon>
				</InputGroup.Root>
			</Card.Panel>
			<Card.Footer className='justify-end'>
				<Button
					render={
						<Link to='/dashboard/links/$linkId' params={{ linkId: created.linkId }} />
					}
				>
					View details
					<Icon name='arrow-right' aria-hidden data-icon='inline-end' />
				</Button>
			</Card.Footer>
		</>
	);
}

function CopyShortLinkButton({ shortUrl }: { shortUrl: string }) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(shortUrl);
			setCopied(true);
			anchoredToastManager.add({
				title: 'Copied to clipboard',
				positionerProps: { anchor: buttonRef.current, sideOffset: 8 },
				onClose: () => setCopied(false),
			});
		} catch {
			toastManager.add({ type: 'error', title: 'Unable to copy link' });
		}
	};

	return (
		<InputGroup.Button
			ref={buttonRef}
			autoFocus
			variant='ghost'
			size='icon-sm'
			aria-label='Copy short link'
			onClick={() => void copy()}
		>
			<span className='grid size-4 shrink-0 place-items-center'>
				<Icon
					name='clipboard'
					aria-hidden
					className={cn(
						'col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none',
						copied ? 'scale-75 opacity-0 blur-[2px]' : 'scale-100 opacity-100 blur-[0px]',
					)}
				/>
				<Icon
					name='check'
					aria-hidden
					className={cn(
						'col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none',
						copied ? 'scale-100 opacity-100 blur-[0px]' : 'scale-75 opacity-0 blur-[2px]',
					)}
				/>
			</span>
		</InputGroup.Button>
	);
}
