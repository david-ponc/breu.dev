import { Card } from '#/core/ui/card';

import { HeroSection } from './hero';
import { HighlightsSection } from './highlights-section';
import { LandingCta } from './landing-cta';
import { LandingHeader } from './layout/landing-header';
import { RecentVisitsSection } from './recent-visits-section';

export function LandingPage({ isSignedIn = false }: { isSignedIn?: boolean }) {
	return (
		<div className='relative isolate flex min-h-svh w-full shrink-0 flex-col antialiased'>
			<LandingHeader isSignedIn={isSignedIn} />
			<main className='flex flex-1 flex-col pb-2 lg:px-2'>
				<Card.Root className='flex-1 gap-0 overflow-hidden py-0'>
					<HeroSection />
					<HighlightsSection />
					<RecentVisitsSection />
					<LandingCta isSignedIn={isSignedIn} />
				</Card.Root>
			</main>
		</div>
	);
}
