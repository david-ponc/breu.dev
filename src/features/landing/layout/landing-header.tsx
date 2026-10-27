import { Link } from '@tanstack/react-router';

import { BreuBrandIcon } from '#/core/icons/breu';
import { Icon } from '#/core/icons/icon';
import { Button } from '#/core/ui/button';
import { useLandingState } from '#/features/landing/use-landing-state';

export function LandingHeader() {
	const { isSignedIn } = useLandingState();
	const label = isSignedIn ? 'Open app' : 'Create account';
	const destination = isSignedIn ? '/dashboard/links' : '/auth/sign-in';

	return (
		<header className='px-6'>
			<nav
				aria-label='Main navigation'
				className='mx-auto flex max-w-[125rem] items-center justify-between gap-6 py-1'
			>
				<Link
					to='/'
					aria-label='breu home'
					className='flex min-h-11 min-w-11 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring'
				>
					<BreuBrandIcon aria-hidden className='h-5 w-auto' />
				</Link>
				<Button
					variant={isSignedIn ? 'ghost' : 'default'}
					className='px-4'
					render={<Link to={destination} />}
				>
					{label}
					<Icon name='arrow-right' aria-hidden data-icon='inline-end' />
				</Button>
			</nav>
		</header>
	);
}
