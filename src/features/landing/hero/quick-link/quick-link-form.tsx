import { Link } from '@tanstack/react-router';
import { type FormEvent, useRef, useState } from 'react';

import { clientEnv } from '#/config/env/client';
import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { ensureHttpsProtocol, shortLinkPath, stripHttpProtocol } from '#/core/lib/url';
import { Button } from '#/core/ui/button';
import { Card } from '#/core/ui/card';
import { InputGroup } from '#/core/ui/input-group';
import { Spinner } from '#/core/ui/loaders/spinner';
import { anchoredToastManager, toastManager } from '#/core/ui/toast';

import type { CreatedQuickLink } from './use-quick-link';
import { useQuickLink } from './use-quick-link';

export function QuickLinkForm({ className }: { className?: string }) {
	const { status, inputError, created, submit, reset } = useQuickLink();
	const [url, setUrl] = useState('');

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void submit(url);
	};

	const panel =
		'w-full justify-self-center transition-[opacity,transform,filter] duration-200 ease-(--ease-out) motion-reduce:transition-none data-[active=false]:pointer-events-none data-[active=false]:translate-y-2 data-[active=false]:opacity-0 data-[active=false]:blur-[2px]';

	return (
		<div className={cn('grid w-full max-w-xl', className)}>
			<form
				noValidate
				onSubmit={onSubmit}
				aria-hidden={status !== 'idle'}
				inert={status !== 'idle'}
				data-active={status === 'idle'}
				className={cn('flex flex-col gap-2', panel)}
			>
				<InputGroup.Root>
					<InputGroup.Addon>
						<InputGroup.Text>https://</InputGroup.Text>
					</InputGroup.Addon>
					<InputGroup.Input
						name='url'
						inputMode='url'
						placeholder='example.com/a-very-long-url'
						aria-invalid={inputError !== null}
						value={stripHttpProtocol(url)}
						onChange={(event) => setUrl(ensureHttpsProtocol(event.target.value))}
					/>
				</InputGroup.Root>

				{inputError ? (
					<p role='alert' className='text-destructive text-sm'>
						{inputError}
					</p>
				) : null}

				<Button type='submit' className='w-full'>
					Shorten
				</Button>
			</form>

			<div
				role='status'
				aria-live='polite'
				aria-hidden={status !== 'creating'}
				inert={status !== 'creating'}
				data-active={status === 'creating'}
				className={cn('flex items-center justify-center gap-3 py-3 text-left', panel)}
			>
				<Spinner size='sm' className='text-primary' />
				<div className='flex flex-col gap-0.5'>
					<p className='font-medium text-sm'>Crafting your link...</p>
					<p className='text-muted-foreground text-sm'>
						We may take a few seconds to read the page.
					</p>
				</div>
			</div>

			{status === 'success' && created ? (
				<QuickLinkSuccessCard created={created} onReset={reset} />
			) : null}
		</div>
	);
}

function linkHost(url: string) {
	const host = stripHttpProtocol(url).split('/')[0];
	return host || url;
}

function QuickLinkSuccessCard({
	created,
	onReset,
}: {
	created: CreatedQuickLink;
	onReset: () => void;
}) {
	return (
		<Card.Root
			size='sm'
			role='status'
			data-stagger=''
			className='quick-link-reveal w-full justify-self-center [--stagger-duration:300ms] [--stagger-step:60ms]'
		>
			<Card.Header>
				<Card.Title className='flex items-center gap-2'>
					<Icon name='check' className='size-4 text-primary' />
					Your link is live
				</Card.Title>
				<Card.Description>
					Redirects to {linkHost(created.url)}. Share it anywhere.
				</Card.Description>
			</Card.Header>

			<Card.Panel>
				<div className='flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-2 py-1.5'>
					<ShortLinkUrl slug={created.slug} />
					<CopyShortLinkButton slug={created.slug} />
				</div>
			</Card.Panel>

			<Card.Footer className='justify-between gap-2'>
				<Button variant='link' size='sm' onClick={onReset}>
					Shorten another
				</Button>
				<Button
					size='sm'
					render={
						<Link to='/dashboard/links/$linkId' params={{ linkId: created.linkId }} />
					}
				>
					Details
					<Icon name='arrow-right' data-icon='inline-end' />
				</Button>
			</Card.Footer>
		</Card.Root>
	);
}

function ShortLinkUrl({ slug }: { slug: string }) {
	const shortUrl = new URL(shortLinkPath(slug), clientEnv.VITE_BASE_URL).href;

	return (
		<span title={shortUrl} className='min-w-0 flex-1 truncate font-mono text-sm'>
			{stripHttpProtocol(shortUrl)}
		</span>
	);
}

function CopyShortLinkButton({ slug }: { slug: string }) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(
				new URL(shortLinkPath(slug), clientEnv.VITE_BASE_URL).href,
			);
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
		<Button
			ref={buttonRef}
			variant='ghost'
			size='icon-sm'
			aria-label='Copy short link'
			className='hit-area-3 shrink-0'
			onClick={() => void copy()}
		>
			<span className='grid size-4 shrink-0 place-items-center'>
				<Icon
					name='clipboard'
					aria-hidden
					className={cn(
						'col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-(--ease-out) motion-reduce:transition-none',
						copied ? 'scale-75 opacity-0 blur-[2px]' : 'scale-100 opacity-100 blur-[0px]',
					)}
				/>
				<Icon
					name='check'
					aria-hidden
					className={cn(
						'col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-(--ease-out) motion-reduce:transition-none',
						copied ? 'scale-100 opacity-100 blur-[0px]' : 'scale-75 opacity-0 blur-[2px]',
					)}
				/>
			</span>
		</Button>
	);
}
