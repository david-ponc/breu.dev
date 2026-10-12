import { useNavigate } from '@tanstack/react-router';
import { startTransition, useState, ViewTransition } from 'react';

import { Icon } from '#/core/icons/icon';
import { authClient } from '#/core/lib/auth/client';
import { Avatar } from '#/core/ui/avatar';
import {
	MenuItem,
	MenuPopup,
	MenuRoot,
	MenuSeparator,
	MenuTrigger,
} from '#/core/ui/menu';
import { Route } from '#/routes/dashboard/route';

const MORPH_NAME = 'user-menu-identity';

function UserIdentity({
	name,
	email,
	image,
}: {
	name: string;
	email?: string;
	image?: string | null;
}) {
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className='flex items-center gap-2'>
			<div className='flex flex-col text-right'>
				<p className='font-medium text-xs'>{name}</p>
				{email ? <p className='text-muted-foreground text-xs'>{email}</p> : null}
			</div>
			<Avatar.Root>
				{image ? (
					<Avatar.Image src={image} alt={name} />
				) : (
					<Avatar.Fallback>{initials}</Avatar.Fallback>
				)}
			</Avatar.Root>
		</div>
	);
}

export function UserMenu() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const user = session.user;
	const email = user.isAnonymous ? undefined : user.email;

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: '/auth/sign-in' });
	};

	const handleOpenChange = (nextOpen: boolean) => {
		startTransition(() => setOpen(nextOpen));
	};

	const identity = <UserIdentity name={user.name} email={email} image={user.image} />;

	return (
		<MenuRoot open={open} onOpenChange={handleOpenChange}>
			<MenuTrigger className='flex cursor-pointer items-center gap-2 rounded-lg'>
				{open ? (
					<div aria-hidden className='invisible'>
						{identity}
					</div>
				) : (
					<ViewTransition name={MORPH_NAME} share='vt-morph' default='none'>
						{identity}
					</ViewTransition>
				)}
			</MenuTrigger>
			<MenuPopup
				keepMounted
				align='end'
				sideOffset={({ anchor }) => -anchor.height - 8}
				alignOffset={-8}
				collisionAvoidance={{ side: 'none', align: 'none', fallbackAxisSide: 'none' }}
				className='w-max min-w-(--anchor-width) rounded-t-none duration-0 data-closed:invisible data-ending-style:scale-100 data-starting-style:scale-100 data-ending-style:opacity-100 data-starting-style:opacity-100'
			>
				<div className='flex items-center justify-end gap-2 px-2 py-2' aria-hidden='true'>
					{open ? (
						<ViewTransition name={MORPH_NAME} share='vt-morph' default='none'>
							{identity}
						</ViewTransition>
					) : null}
				</div>
				{open ? (
					<div
						data-stagger
						className='overflow-hidden [--stagger-duration:280ms] [--stagger-step:40ms]'
					>
						<MenuSeparator />
						<MenuItem onClick={handleSignOut} variant='destructive'>
							<Icon name='door-out' />
							Cerrar sesión
						</MenuItem>
					</div>
				) : null}
			</MenuPopup>
		</MenuRoot>
	);
}
