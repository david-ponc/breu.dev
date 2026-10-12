import { PageTransition } from '#/core/ui/motion';

import { ProductPreview } from './product-preview';
import { QuickLinkForm } from './quick-link/quick-link-form';

export function HeroSection() {
	return (
		<section
			aria-labelledby='hero-title'
			className='mx-auto w-full max-w-7xl px-6 py-12 sm:py-16 lg:px-12'
		>
			<PageTransition className='grid grid-cols-1 gap-6 [--stagger-duration:420ms] [--stagger-step:60ms] lg:grid-cols-[minmax(0,1fr)_36rem] lg:gap-x-16'>
				<h1
					id='hero-title'
					className='text-balance font-semibold text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:self-end lg:text-6xl'
				>
					<span className='block'>Short links.</span> Clear insights.
				</h1>
				<p className='max-w-md text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg lg:col-start-1 lg:row-start-2 lg:self-start'>
					Shorten your links, follow their activity, and manage everything in one place.
				</p>
				<QuickLinkForm className='lg:col-start-2 lg:row-span-2 lg:row-start-1' />
				<ProductPreview className='mt-8 lg:col-span-2 lg:mt-12' />
			</PageTransition>
		</section>
	);
}
