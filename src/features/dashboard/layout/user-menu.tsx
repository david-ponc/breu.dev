import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

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

function UserIdentity({
	name,
	email,
	image,
}: {
	name: string;
	email: string;
	image?: string | null;
}) {
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<>
			<div className='flex flex-col text-right'>
				<p className='font-medium text-xs'>{name}</p>
				<p className='text-muted-foreground text-xs'>{email}</p>
			</div>
			<Avatar.Root>
				{image ? (
					<Avatar.Image src={image} alt={name} />
				) : (
					<Avatar.Fallback>{initials}</Avatar.Fallback>
				)}
			</Avatar.Root>
		</>
	);
}

export function UserMenu() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [triggerVisible, setTriggerVisible] = useState(true);

	const user = session.user;

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: '/auth/sign-in' });
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (nextOpen) {
			setTriggerVisible(false);
		}
	};

	const handleOpenChangeComplete = (nextOpen: boolean) => {
		if (!nextOpen) {
			setTriggerVisible(true);
		}
	};

	return (
		<MenuRoot
			open={open}
			onOpenChange={handleOpenChange}
			onOpenChangeComplete={handleOpenChangeComplete}
		>
			<MenuTrigger
				className='flex cursor-pointer items-center gap-2 rounded-lg'
				style={{ opacity: triggerVisible ? 1 : 0 }}
			>
				<UserIdentity name={user.name} email={user.email} image={user.image} />
			</MenuTrigger>
			<MenuPopup
				align='end'
				sideOffset={({ anchor }) => -anchor.height - 8}
				alignOffset={-8}
				collisionAvoidance={{ side: 'none', align: 'none', fallbackAxisSide: 'none' }}
				className='w-max min-w-(--anchor-width) rounded-t-none data-ending-style:scale-100 data-starting-style:scale-100'
			>
				<div className='flex items-center justify-end gap-2 px-2 py-2' aria-hidden='true'>
					<UserIdentity name={user.name} email={user.email} image={user.image} />
				</div>
				<MenuSeparator />
				<MenuItem onClick={handleSignOut} variant='destructive'>
					<Icon name='door-out' />
					Cerrar sesión
				</MenuItem>
			</MenuPopup>
		</MenuRoot>
	);
}
