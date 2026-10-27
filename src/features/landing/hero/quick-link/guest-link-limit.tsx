import { Link } from '@tanstack/react-router';

import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { Button } from '#/core/ui/button';
import { Card } from '#/core/ui/card';

export function GuestLinkLimit({ className }: { className?: string }) {
	return (
		<Card.Root className={cn('relative w-full min-w-0', className)}>
			<Card.Header>
				<h2 className='font-medium text-lg tracking-tight'>You've used your free link</h2>
				<Card.Description>
					Create an account to make more links and manage them in one place.
				</Card.Description>
			</Card.Header>
			<Card.Footer className='mt-auto justify-end'>
				<Button render={<Link to='/auth/sign-in' search={{ error: undefined }} />}>
					Create a free account
					<Icon name='arrow-right' aria-hidden data-icon='inline-end' />
				</Button>
			</Card.Footer>
		</Card.Root>
	);
}
