import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { BreuBrandIcon } from '#/core/icons/breu';
import { getSession } from '#/core/lib/auth/functions';
import { Card } from '#/core/ui/card';
import { Navbar } from '#/features/dashboard/layout/navbar';
import { UserMenu } from '#/features/dashboard/layout/user-menu';

export const Route = createFileRoute('/dashboard')({
	beforeLoad: async () => {
		const session = await getSession();

		if (!session) {
			throw redirect({ to: '/auth/sign-in' });
		}

		return { session };
	},
	component: Layout,
});

function Layout() {
	return (
		<div className='relative isolate flex min-h-svh w-full flex-col'>
			<header className='flex items-center px-6'>
				<div className='mx-auto flex min-w-0 max-w-[125rem] flex-1 items-center gap-6 py-1'>
					<div>
						<BreuBrandIcon className='h-4 w-auto' />
					</div>
					<Navbar />
					<UserMenu />
				</div>
			</header>
			<div className='flex flex-1 flex-col pb-2 lg:px-2'>
				<Card.Root className='flex-1'>
					<Card.Panel className='mx-auto size-full max-w-[125rem] flex-1'>
						<Outlet />
					</Card.Panel>
				</Card.Root>
			</div>
		</div>
	);
}
