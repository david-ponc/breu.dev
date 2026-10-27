import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';

import { BreuBrandIcon } from '#/core/icons/breu';
import { Icon } from '#/core/icons/icon';
import { authClient } from '#/core/lib/auth/client';
import { getSession } from '#/core/lib/auth/functions';
import { Button } from '#/core/ui/button';
import { Card } from '#/core/ui/card';
import { Field } from '#/core/ui/field';
import { GridPattern } from '#/core/ui/patterns/grid-pattern';
import { MagicLinkSignInForm } from '#/features/auth/magic-link-sign-in-form';

export const Route = createFileRoute('/auth/sign-in')({
	validateSearch: (search: Record<string, unknown>) => ({
		error: typeof search.error === 'string' ? search.error : undefined,
	}),
	beforeLoad: async () => {
		const session = await getSession();

		if (session && !session.user.isAnonymous) {
			throw redirect({ to: '/dashboard/links' });
		}
	},
	component: Page,
	head: () => ({
		meta: [
			{ title: 'Sign in | breu.dev' },
			{
				name: 'description',
				content: 'Sign in to manage your short links and view their analytics.',
			},
			{ name: 'robots', content: 'noindex, nofollow' },
		],
	}),
});

type SocialProvider = 'github' | 'discord';

function SocialSignInButton({ provider }: { provider: SocialProvider }) {
	const [loading, setLoading] = useState(false);
	const name = provider === 'github' ? 'GitHub' : 'Discord';

	return (
		<Button
			variant='outline'
			loading={loading}
			onClick={async () => {
				setLoading(true);
				try {
					const { error } = await authClient.signIn.social({
						provider,
						callbackURL: '/dashboard/links',
					});
					if (error) setLoading(false);
				} catch {
					setLoading(false);
				}
			}}
		>
			<Icon name={provider} className='size-4' />
			Sign in with {name}
		</Button>
	);
}

function Page() {
	const { error: linkError } = Route.useSearch();

	return (
		<div className='grid size-full h-dvh place-items-center'>
			<GridPattern />
			<div
				data-stagger
				className='relative flex w-full max-w-sm flex-col items-start gap-3'
			>
				<div className='flex items-center gap-0.75'>
					<Icon name='link' className='mt-1 size-4 text-brand' />
					<BreuBrandIcon className='h-4 w-auto' />
				</div>
				<Card.Root className='z-1 overflow-auto'>
					<Card.Header>
						<Card.Title>Sign in to your account</Card.Title>
						<Card.Description>
							Sign in with GitHub, Discord, or an email link
						</Card.Description>
					</Card.Header>
					<Card.Panel className='flex flex-col gap-3'>
						<SocialSignInButton provider='github' />
						<SocialSignInButton provider='discord' />
						<Field.Separator className='mt-4 bg-card'>Or continue with</Field.Separator>
					</Card.Panel>
					<Card.Footer variant='ghost' className='flex-col items-stretch gap-2'>
						<MagicLinkSignInForm linkError={Boolean(linkError)} />
					</Card.Footer>
				</Card.Root>
			</div>
		</div>
	);
}
