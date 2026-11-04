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
		<header className='flex items-center px-6'>
			<nav
				aria-label='Main navigation'
				className='mx-auto flex min-w-0 max-w-[125rem] flex-1 items-center gap-6 py-1'
			>
				<Link
					to='/'
					aria-label='breu home'
					className='flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring'
				>
					<BreuBrandIcon aria-hidden className='h-4 w-auto' />
				</Link>
				<Button
					variant={isSignedIn ? 'ghost' : 'default'}
					className='ml-auto px-4'
					render={<Link to={destination} />}
				>
					{label}
					<Icon name='arrow-right' aria-hidden data-icon='inline-end' />
				</Button>
			</nav>
		</header>
	);
}
