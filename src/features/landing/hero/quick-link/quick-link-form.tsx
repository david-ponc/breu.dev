import { Link } from '@tanstack/react-router';
import { type SubmitEvent, useId, useLayoutEffect, useRef, ViewTransition } from 'react';

import { Icon } from '#/core/icons/icon';
import { InfoIcon } from '#/core/icons/info';
import { cn } from '#/core/lib/cn';
import { ensureHttpsProtocol, stripHttpProtocol } from '#/core/lib/url';
import { Alert } from '#/core/ui/alert';
import { Button } from '#/core/ui/button';
import { Card } from '#/core/ui/card';
import { Field } from '#/core/ui/field';
import { InputGroup } from '#/core/ui/input-group';

import { QuickLinkPending } from './quick-link-pending';
import { QuickLinkSuccess } from './quick-link-success';
import { QuickLinkValuesSchema } from './schema';
import { useQuickLink } from './use-quick-link';

export function QuickLinkForm({ className }: { className?: string }) {
	const {
		form,
		status,
		inputError,
		created,
		clearInputError,
		shouldFocusUrlAfterSubmit,
	} = useQuickLink();
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const hasSubmitted = useRef(false);

	useLayoutEffect(() => {
		if (status === 'idle' && hasSubmitted.current) {
			inputRef.current?.focus({ preventScroll: true });
		}
	}, [status]);

	const handleFormSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		hasSubmitted.current = true;
		await form.handleSubmit();
		if (shouldFocusUrlAfterSubmit()) inputRef.current?.focus({ preventScroll: true });
	};

	return (
		<ViewTransition default='none' update='vt-dissolve vt-quick'>
			<Card.Root className={cn('relative w-full min-w-0', className)}>
				<p role='status' aria-live='polite' aria-atomic='true' className='sr-only'>
					{status === 'creating'
						? 'Crafting your link… We may take a few seconds to read the page.'
						: status === 'success'
							? 'Your link is live. Ready to copy and share.'
							: ''}
				</p>
				{status === 'success' && created ? (
					<QuickLinkSuccess created={created} />
				) : (
					<div
						aria-hidden={status === 'creating'}
						inert={status === 'creating'}
						className={cn('contents', status === 'creating' && 'invisible')}
					>
						<Card.Header>
							<Card.Title id={`${id}-title`}>Create a new link</Card.Title>
							<Card.Description>
								Create a new link to redirect your users to any destination URL.
							</Card.Description>
						</Card.Header>
						<Card.Panel>
							<form
								noValidate
								onSubmit={handleFormSubmit}
								aria-labelledby={`${id}-title`}
								aria-hidden={status !== 'idle'}
								inert={status !== 'idle'}
								className='flex flex-col justify-center gap-4'
							>
								<form.AppField
									name='url'
									validators={{ onChange: QuickLinkValuesSchema.shape.url }}
								>
									{(field) => (
										<Field.Root
											invalid={!field.state.meta.isValid || inputError !== null}
										>
											<Field.Label>Destination URL</Field.Label>
											<Field.Description>
												Enter the destination URL, including its domain.
											</Field.Description>
											<InputGroup.Root>
												<InputGroup.Addon aria-hidden>
													<InputGroup.Text>https://</InputGroup.Text>
												</InputGroup.Addon>
												<InputGroup.Input
													ref={inputRef}
													name={field.name}
													inputMode='url'
													enterKeyHint='go'
													placeholder='example.com/your-long-link'
													aria-invalid={!field.state.meta.isValid || inputError !== null}
													value={stripHttpProtocol(field.state.value)}
													onBlur={field.handleBlur}
													onChange={(event) => {
														clearInputError();
														field.handleChange(ensureHttpsProtocol(event.target.value));
													}}
												/>
											</InputGroup.Root>
											<Field.Error
												match={!field.state.meta.isValid || inputError !== null}
												className='text-sm'
											>
												{inputError ??
													'That does not look like a valid URL. Check it and try again.'}
											</Field.Error>
										</Field.Root>
									)}
								</form.AppField>
								<Button
									type='submit'
									loading={status === 'creating'}
									className='dark:text-zinc-950'
								>
									Create link
									<Icon name='link' aria-hidden data-icon='inline-end' />
								</Button>
							</form>
						</Card.Panel>
						<Card.Footer variant='ghost' className='bg-transparent pt-0'>
							<Alert.Root
								variant='info'
								role='note'
								aria-labelledby={`${id}-guest-title`}
							>
								<InfoIcon aria-hidden />
								<Alert.Title id={`${id}-guest-title`}>
									One link without an account
								</Alert.Title>
								<Alert.Description>
									Guests can create one link.{' '}
									<Link to='/auth/sign-in'>Create an account</Link> to get full access to
									the platform.
								</Alert.Description>
							</Alert.Root>
						</Card.Footer>
					</div>
				)}
				{status === 'creating' ? <QuickLinkPending /> : null}
			</Card.Root>
		</ViewTransition>
	);
}
