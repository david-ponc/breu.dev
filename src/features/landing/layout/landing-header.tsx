import { Link } from '@tanstack/react-router';

import { BreuBrandIcon } from '#/core/icons/breu';
import { Icon } from '#/core/icons/icon';
import { Button } from '#/core/ui/button';

export function LandingHeader() {
	return (
		<header className='px-6'>
			<nav
				aria-label='Main navigation'
				className='mx-auto flex h-16 max-w-[125rem] items-center justify-between gap-6'
			>
				<Link
					to='/'
					aria-label='breu home'
					className='flex min-h-11 min-w-11 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring'
				>
					<BreuBrandIcon aria-hidden className='h-5 w-auto' />
				</Link>
				<Button
					variant='ghost'
					className='h-11 px-3'
					render={<Link to='/dashboard/links' />}
				>
					Open app
					<Icon name='arrow-right' aria-hidden data-icon='inline-end' />
				</Button>
			</nav>
		</header>
	);
}
