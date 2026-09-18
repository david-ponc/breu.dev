import { createFileRoute, Link } from '@tanstack/react-router';

import { Icon } from '#/core/icons/icon';
import { Button } from '#/core/ui/button';
import { CreateLinkForm } from '#/features/links/create/create-link-form';

export const Route = createFileRoute('/dashboard/links/new')({
	component: Page,
});

function Page() {
	return (
		<>
			<header className='flex flex-col-reverse gap-4 sm:flex-row sm:justify-between'>
				<Button variant='outline' render={<Link to='/dashboard/links' />}>
					<Icon name='chevron-left' data-icon='inline-start' />
					Back
				</Button>
			</header>
			<section className='mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6'>
				<header>
					<h1 className='font-bold text-3xl tracking-tight'>Create a new link</h1>
					<p className='mt-1 text-muted-foreground text-sm'>
						Create a new link to redirect your users to any destination URL.
					</p>
				</header>
				<CreateLinkForm />
			</section>
		</>
	);
}
