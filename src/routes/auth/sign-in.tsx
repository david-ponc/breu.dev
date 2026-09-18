import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';

import { BreuBrandIcon } from '#/core/icons/breu';
import { Icon } from '#/core/icons/icon';
import { authClient } from '#/core/lib/auth/client';
import { getSession } from '#/core/lib/auth/functions';
import { Button } from '#/core/ui/button';
import { Card } from '#/core/ui/card';
import { Field } from '#/core/ui/field';
import { Input } from '#/core/ui/input';
import { GridPattern } from '#/core/ui/patterns/grid-pattern';

export const Route = createFileRoute('/auth/sign-in')({
	beforeLoad: async () => {
		const session = await getSession();

		if (session) {
			throw redirect({ to: '/dashboard/links' });
		}
	},
	component: Page,
});

function SignInWithGitHubButton() {
	const [loading, setLoading] = useState(false);

	return (
		<Button
			variant='outline'
			loading={loading}
			onClick={async () => {
				setLoading(true);
				const { error } = await authClient.signIn.social({
					provider: 'github',
					callbackURL: '/dashboard/links',
				});
				if (error) setLoading(false);
			}}
		>
			<Icon name='github' className='size-4' />
			Sign in with GitHub
		</Button>
	);
}

function Page() {
	return (
		<div className='grid size-full h-dvh place-items-center'>
			<GridPattern />
			<div className='relative flex w-full max-w-sm flex-col items-start gap-3'>
				<div className='flex items-center gap-0.75'>
					<Icon name='link' className='mt-1 size-4 text-brand' />
					<BreuBrandIcon className='h-4 w-auto' />
				</div>
				<Card.Root className='z-1 overflow-auto'>
					<Card.Header>
						<Card.Title>Sign in to your account</Card.Title>
						<Card.Description>
							Sign in with your GitHub or Discord account
						</Card.Description>
					</Card.Header>
					<Card.Panel className='flex flex-col gap-3'>
						<SignInWithGitHubButton />
						<Button variant='outline'>
							<Icon name='discord' className='size-4' />
							Sign in with Discord
						</Button>
						<Field.Separator className='mt-4 bg-card'>Or continue with</Field.Separator>
					</Card.Panel>
					<Card.Footer variant='ghost' className='flex-col items-stretch gap-2'>
						<Field.Root>
							<Field.Label>Email address</Field.Label>
							<Field.Description>
								We'll email you a magic link to sign in without a password.
							</Field.Description>
							<Field.Item className='w-full'>
								<Input type='email' placeholder='ejemplo@dominio.com' />
							</Field.Item>
							<Field.Error>Invalid email address.</Field.Error>
						</Field.Root>
						<Button className='mt-3 w-full'>Continue</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		</div>
	);
}
