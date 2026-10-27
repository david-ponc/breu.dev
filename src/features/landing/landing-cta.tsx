import { Link } from '@tanstack/react-router';

import { Icon } from '#/core/icons/icon';
import { Button } from '#/core/ui/button';
import { DiagonalPattern } from '#/core/ui/patterns/diagonal-pattern';
import { useLandingState } from '#/features/landing/use-landing-state';

export function LandingCta() {
	const { isSignedIn } = useLandingState();
	const label = isSignedIn ? 'Open your dashboard' : 'Create your account';
	const destination = isSignedIn ? '/dashboard/links' : '/auth/sign-in';

	return (
		<section
			aria-labelledby='landing-cta-title'
			className='relative isolate overflow-hidden border-border border-t'
		>
			<DiagonalPattern lineOpacity={0.05} />
			<div className='relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-6 py-14 sm:py-18 md:flex-row md:items-end md:justify-between lg:px-12'>
				<div className='max-w-2xl'>
					<h2
						id='landing-cta-title'
						className='mt-3 text-balance font-semibold text-3xl tracking-tight sm:text-4xl'
					>
						{isSignedIn
							? 'Ready to get back to your links?'
							: 'Make room for every link.'}
					</h2>
					<p className='mt-3 max-w-xl text-pretty text-muted-foreground leading-relaxed'>
						{isSignedIn
							? 'Your links and their activity are waiting in your workspace.'
							: 'Create an account to organize all your links and see what happens after you share them.'}
					</p>
				</div>
				<Button className='w-fit shrink-0 px-4' render={<Link to={destination} />}>
					{label}
					<Icon name='arrow-right' aria-hidden data-icon='inline-end' />
				</Button>
			</div>
		</section>
	);
}
