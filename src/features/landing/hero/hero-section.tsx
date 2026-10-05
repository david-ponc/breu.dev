import { PageTransition } from '#/core/ui/motion';

import { QuickLinkForm } from './quick-link/quick-link-form';

export function HeroSection() {
	return (
		<main className='flex grow items-center justify-center px-6 py-16'>
			<PageTransition className='flex w-full max-w-xl flex-col items-center gap-8 text-center [--stagger-step:80ms]'>
				<div className='flex flex-col gap-3'>
					<h1 className='text-balance font-bold text-4xl tracking-tight sm:text-5xl'>
						Shorten any link in one click.
					</h1>
					<p className='mx-auto max-w-md text-pretty text-muted-foreground sm:text-base'>
						Paste a long URL and get a clean, shareable link. No account, no friction.
					</p>
				</div>

				<QuickLinkForm />
			</PageTransition>
		</main>
	);
}
