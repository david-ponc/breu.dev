import { Card } from '#/core/ui/card';
import { Spinner } from '#/core/ui/loaders/spinner';

export function QuickLinkPending() {
	return (
		<Card.Panel className='absolute inset-0 flex flex-col items-center justify-center gap-3 text-center'>
			<div aria-hidden className='text-muted-foreground'>
				<Spinner size='sm' />
			</div>
			<h2 className='font-medium text-lg tracking-tight'>Crafting your link…</h2>
			<p className='max-w-xs text-pretty text-muted-foreground text-sm'>
				We may take a few seconds to read the page.
			</p>
		</Card.Panel>
	);
}
