import { Card } from '#/core/ui/card';

import { HeroSection } from './hero';
import { LandingHeader } from './layout/landing-header';

export function LandingPage() {
	return (
		<div className='relative isolate flex min-h-svh w-full shrink-0 flex-col antialiased'>
			<LandingHeader />
			<main className='flex flex-1 flex-col pb-2 lg:px-2'>
				<Card.Root className='flex-1 gap-0 py-0'>
					<HeroSection />
				</Card.Root>
			</main>
		</div>
	);
}
