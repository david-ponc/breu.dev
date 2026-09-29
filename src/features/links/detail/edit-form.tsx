import { useSuspenseQuery } from '@tanstack/react-query';

import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { ensureHttpsProtocol, stripHttpProtocol } from '#/core/lib/url';
import { Button } from '#/core/ui/button';
import { ButtonGroup } from '#/core/ui/button-group';
import { Card } from '#/core/ui/card';
import { Field } from '#/core/ui/field';
import { Input } from '#/core/ui/input';
import { InputGroup } from '#/core/ui/input-group';
import { Textarea } from '#/core/ui/textarea';
import { Tooltip } from '#/core/ui/tooltip';
import { CreateLinkValuesSchema } from '#/features/links/create/schema';

import { userLinkQueryOptions } from './query';
import { useEditLinkForm } from './use-edit-link-form';

const tooltipHandle = Tooltip.createHandle<string>();

interface EditLinkFormProps {
	linkId: string;
	userId: string;
}

export function EditLinkForm({ linkId, userId }: EditLinkFormProps) {
	const { data: link } = useSuspenseQuery(userLinkQueryOptions(userId, linkId));
	const [form, { isGeneratingSlug }, { generateSlug }] = useEditLinkForm(link);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<Card.Root>
				<Card.Header>
					<Card.Title>Link details</Card.Title>
					<Card.Description>
						Update the destination, slug, or internal notes for this link.
					</Card.Description>
				</Card.Header>
				<Card.Panel className='space-y-6'>
					<form.AppField
						name='url'
						validators={{ onChange: CreateLinkValuesSchema.shape.url }}
					>
						{(field) => (
							<Field.Root invalid={!field.state.meta.isValid}>
								<Field.Label>Destination URL</Field.Label>
								<Field.Description>
									The URL your users will be redirected to when they visit your link.
								</Field.Description>
								<InputGroup.Root className='w-full'>
									<InputGroup.Addon>
										<InputGroup.Text>https://</InputGroup.Text>
									</InputGroup.Addon>
									<InputGroup.Input
										name={field.name}
										value={stripHttpProtocol(field.state.value)}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(ensureHttpsProtocol(e.target.value))
										}
									/>
								</InputGroup.Root>
								<Field.Error match={!field.state.meta.isValid}>
									{field.state.meta.errors.at(0)?.message}
								</Field.Error>
							</Field.Root>
						)}
					</form.AppField>

					<form.AppField
						name='slug'
						validators={{ onChange: CreateLinkValuesSchema.shape.slug }}
					>
						{(field) => (
							<Field.Root invalid={!field.state.meta.isValid}>
								<Field.Label>Slug</Field.Label>
								<Field.Description>
									The slug is the unique identifier for your link. It will be used in the
									URL.
								</Field.Description>
								<ButtonGroup.Root
									className={cn('w-full', isGeneratingSlug && 'data-loading')}
								>
									<Input
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isGeneratingSlug}
									/>
									<Tooltip.Provider>
										<Tooltip.Trigger
											handle={tooltipHandle}
											payload={'Generate new slug'}
											render={
												<Button
													size='icon'
													variant='outline'
													onClick={() => generateSlug()}
													loading={isGeneratingSlug}
												>
													<Icon name='refresh' className='size-3.5' />
												</Button>
											}
										/>
										<Tooltip.Root handle={tooltipHandle}>
											{({ payload }) => (
												<Tooltip.Popup>{payload as string}</Tooltip.Popup>
											)}
										</Tooltip.Root>
									</Tooltip.Provider>
								</ButtonGroup.Root>
								<Field.Error match={!field.state.meta.isValid}>
									{field.state.meta.errors.at(0)?.message}
								</Field.Error>
							</Field.Root>
						)}
					</form.AppField>

					<form.AppField
						name='comments'
						validators={{ onChange: CreateLinkValuesSchema.shape.comments }}
					>
						{(field) => (
							<Field.Root invalid={!field.state.meta.isValid}>
								<Field.Label>Comments</Field.Label>
								<Field.Description>
									Use the comments to add context or internal notes about this link.
								</Field.Description>
								<Textarea
									aria-label='Set your comments'
									name={field.name}
									value={field.state.value || ''}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								<Field.Error match={!field.state.meta.isValid}>
									{field.state.meta.errors.at(0)?.message}
								</Field.Error>
							</Field.Root>
						)}
					</form.AppField>
				</Card.Panel>
				<Card.Footer className='justify-end'>
					<Button type='submit' loading={form.state.isSubmitting}>
						Save changes
					</Button>
				</Card.Footer>
			</Card.Root>
		</form>
	);
}
