import { type SubmitEvent, useState, useTransition, ViewTransition } from 'react';

import { Icon } from '#/core/icons/icon';
import { authClient } from '#/core/lib/auth/client';
import { Alert } from '#/core/ui/alert';
import { Button } from '#/core/ui/button';
import { Field } from '#/core/ui/field';
import { Input } from '#/core/ui/input';

type Status = 'idle' | 'success' | 'error';

interface MagicLinkSignInFormProps {
	linkError?: boolean;
}

export function MagicLinkSignInForm({ linkError = false }: MagicLinkSignInFormProps) {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<Status>(linkError ? 'error' : 'idle');
	const [isExpiredLinkError, setIsExpiredLinkError] = useState(linkError);
	const [isPending, startTransition] = useTransition();

	const handleSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		startTransition(() => {
			setStatus('idle');
			setIsExpiredLinkError(false);
		});

		startTransition(async () => {
			try {
				const { error } = await authClient.signIn.magicLink({
					email: email.trim(),
					callbackURL: '/dashboard/links',
					newUserCallbackURL: '/dashboard/links',
					errorCallbackURL: '/auth/sign-in',
				});

				startTransition(() => setStatus(error ? 'error' : 'success'));
			} catch {
				startTransition(() => setStatus('error'));
			}
		});
	};

	const returnToForm = () => {
		startTransition(() => {
			setEmail('');
			setStatus('idle');
			setIsExpiredLinkError(false);
		});
	};

	return (
		<ViewTransition default='none' update='vt-dissolve vt-quick'>
			{status === 'success' ? (
				<div className='flex flex-col gap-2'>
					<Alert.Root variant='success' role='status' aria-live='polite'>
						<Icon name='check' aria-hidden className='size-4' />
						<div>
							<Alert.Title>Check your inbox</Alert.Title>
							<Alert.Description>
								If this address can sign in, a link will arrive shortly. Check your inbox
								and spam folder.
							</Alert.Description>
						</div>
					</Alert.Root>
					<Button
						type='button'
						variant='link'
						className='min-h-11 self-start px-1'
						onClick={returnToForm}
					>
						Use another email
					</Button>
				</div>
			) : (
				<form onSubmit={handleSubmit} className='flex flex-col gap-3'>
					<Field.Root invalid={status === 'error' && !isExpiredLinkError}>
						<Field.Label htmlFor='magic-link-email'>Email address</Field.Label>
						<Field.Description>
							We'll email you a magic link to sign in without a password.
						</Field.Description>
						<Field.Item className='w-full'>
							<Input
								id='magic-link-email'
								name='email'
								type='email'
								autoComplete='email'
								placeholder='you@example.com'
								required
								value={email}
								aria-invalid={status === 'error' && !isExpiredLinkError}
								disabled={isPending}
								onChange={(event) => {
									setEmail(event.target.value);
									if (status === 'error') {
										startTransition(() => {
											setStatus('idle');
											setIsExpiredLinkError(false);
										});
									}
								}}
							/>
						</Field.Item>
						<Field.Error match={status === 'error' && !isExpiredLinkError}>
							We couldn't send the link. Please check the address and try again.
						</Field.Error>
					</Field.Root>
					{status === 'error' && isExpiredLinkError ? (
						<p role='alert' className='text-destructive-foreground text-sm'>
							That sign-in link is invalid or expired. Request a new one.
						</p>
					) : null}
					<Button type='submit' className='mt-1 w-full' loading={isPending}>
						Continue with email
					</Button>
				</form>
			)}
		</ViewTransition>
	);
}
