import { LinkIcon } from '#/core/icons/link';
import { buttonVariants } from '#/core/ui/button';
import { Empty } from '#/core/ui/empty';
import { GridPattern } from '#/core/ui/patterns/grid-pattern';

export function RedirectNotFoundPage() {
	return (
		<main className='relative isolate flex min-h-svh items-center justify-center overflow-hidden px-6 py-16'>
			<GridPattern
				cellSize={32}
				fade={46}
				className='pointer-events-none stroke-border/60'
			/>
			<div
				aria-hidden='true'
				className='pointer-events-none absolute top-1/2 left-1/2 size-[min(84vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/5 blur-3xl'
			/>
			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-x-0 bottom-[calc(50%+6rem)] z-0 flex justify-center'
			>
				<span className='mask-[radial-gradient(ellipse_75%_95%_at_50%_118%,transparent_50%,black_86%)] translate-y-[26%] select-none font-mono font-semibold text-[clamp(11rem,34vw,25rem)] text-sky-500/20 leading-[0.78] tracking-[-0.11em]'>
					404
				</span>
			</div>
			<Empty.Root className='relative z-1 flex-none gap-4 py-0'>
				<Empty.Media variant='icon' className='z-1 mb-0'>
					<LinkIcon aria-hidden='true' />
				</Empty.Media>
				<Empty.Header className='max-w-sm gap-1'>
					<Empty.Title className='text-balance text-3xl tracking-tight sm:text-4xl'>
						Page not found
					</Empty.Title>
					<Empty.Description className='text-base leading-relaxed'>
						We couldn’t find the page you were looking for.
					</Empty.Description>
				</Empty.Header>
				<Empty.Content className='mt-2'>
					<a href='/' className={buttonVariants()}>
						Back to breu.dev
					</a>
				</Empty.Content>
			</Empty.Root>
		</main>
	);
}
