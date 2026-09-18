import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { ensureHttpsProtocol, stripHttpProtocol } from '#/core/lib/url';
import { Button } from '#/core/ui/button';
import { ButtonGroup } from '#/core/ui/button-group';
import { Field } from '#/core/ui/field';
import { Input } from '#/core/ui/input';
import { InputGroup } from '#/core/ui/input-group';
import { Textarea } from '#/core/ui/textarea';
import { Tooltip } from '#/core/ui/tooltip';

import { type CreateLinkValues, CreateLinkValuesSchema } from './schema';
import { useCreateLinkForm } from './use-create-link-form';

const tooltipHandle = Tooltip.createHandle<string>();

interface Props {
	defaultValues?: Partial<CreateLinkValues>;
}

export function CreateLinkForm(props: Props) {
	const [
		form,
		{ isGenerating, isGeneratingSlug, isInitialSlugPending },
		{ generateSlug },
	] = useCreateLinkForm(props);

	return (
		<form
			className='grow space-y-6'
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppField
				name='url'
				validators={{
					onChange: CreateLinkValuesSchema.shape.url,
				}}
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
								onChange={(e) => field.handleChange(ensureHttpsProtocol(e.target.value))}
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
				validators={{
					onChange: CreateLinkValuesSchema.shape.slug,
				}}
			>
				{(field) => (
					<Field.Root invalid={!field.state.meta.isValid}>
						<Field.Label>Slug</Field.Label>
						<Field.Description>
							The slug is the unique identifier for your link. It will be used in the URL
						</Field.Description>
						<ButtonGroup.Root className={cn('w-full', isGenerating && 'data-loading')}>
							<Input
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								disabled={isGenerating}
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
											className={cn({
												'pointer-events-none text-muted-foreground': isInitialSlugPending,
											})}
										>
											<Icon name='refresh' className='size-3.5' />
										</Button>
									}
								/>

								<Tooltip.Root handle={tooltipHandle}>
									{({ payload }) => <Tooltip.Popup>{payload as string}</Tooltip.Popup>}
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
				validators={{
					onChange: CreateLinkValuesSchema.shape.comments,
				}}
			>
				{(field) => (
					<Field.Root invalid={!field.state.meta.isValid}>
						<Field.Label>Comments</Field.Label>
						<Field.Description>
							Use the comments to add context or internal notes about this new link.
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

			<Button
				type='submit'
				className='sticky bottom-4 mt-auto w-full'
				loading={form.state.isSubmitting}
			>
				Craft link
			</Button>
		</form>
	);
}
