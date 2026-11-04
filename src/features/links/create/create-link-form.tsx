import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { ensureHttpsProtocol, stripHttpProtocol } from '#/core/lib/url';
import { Button } from '#/core/ui/button';
import { ButtonGroup } from '#/core/ui/button-group';
import { Field } from '#/core/ui/field';
import { Input } from '#/core/ui/input';
import { InputGroup } from '#/core/ui/input-group';
import { Textarea } from '#/core/ui/textarea';
import { anchoredToastManager } from '#/core/ui/toast';
import { Tooltip } from '#/core/ui/tooltip';

import { type CreateLinkValues, CreateLinkValuesSchema } from './schema';
import { useCreateLinkForm } from './use-create-link-form';

const slugTooltipHandle = Tooltip.createHandle<string>();

interface Props {
	defaultValues?: Partial<CreateLinkValues>;
}

export function CreateLinkForm(props: Props) {
	const [
		form,
		{
			withValidUrl,
			isGenerating,
			isGeneratingSlug,
			isGeneratingAiSlug,
			isInitialSlugPending,
		},
		{ generateSlug, generateAiSlug },
	] = useCreateLinkForm(props);
	const isUrlMissing = !withValidUrl;
	const randomSlugTooltip = isUrlMissing
		? 'Enter a destination URL to generate a random slug'
		: 'Generate a random slug';
	const aiSlugTooltip = isUrlMissing
		? 'Enter a destination URL to generate an AI slug'
		: 'Generate a slug with AI';
	const disabledButtonClassName = cn(
		'aria-disabled:cursor-not-allowed aria-disabled:active:scale-100',
		isUrlMissing && 'opacity-50',
		isGenerating && 'not-data-loading:data-disabled:opacity-100',
	);

	const handleGenerateSlug = async (
		generate: () => Promise<boolean>,
		anchor: HTMLButtonElement,
	) => {
		if (!(await generate())) return;

		anchoredToastManager.add({
			title: 'Slug generated successfully',
			positionerProps: { anchor, sideOffset: 8 },
		});
	};

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
						<Tooltip.Provider>
							<ButtonGroup.Root className={cn('w-full', isGenerating && 'data-loading')}>
								<Input
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isGenerating}
									className={cn(
										isGenerating && 'disabled:bg-secondary disabled:opacity-100',
									)}
								/>

								<Tooltip.Trigger
									handle={slugTooltipHandle}
									payload={randomSlugTooltip}
									render={
										<Button
											size='icon'
											variant='outline'
											onClick={(event) =>
												void handleGenerateSlug(generateSlug, event.currentTarget)
											}
											loading={isGeneratingSlug}
											disabled={isInitialSlugPending || isGeneratingAiSlug}
											aria-disabled={isUrlMissing || isGenerating || isInitialSlugPending}
											aria-label={randomSlugTooltip}
											className={disabledButtonClassName}
										>
											<Icon name='refresh' className='size-3.5' />
										</Button>
									}
								/>

								<Tooltip.Trigger
									handle={slugTooltipHandle}
									payload={aiSlugTooltip}
									render={
										<Button
											size='icon'
											variant='outline'
											onClick={(event) =>
												void handleGenerateSlug(generateAiSlug, event.currentTarget)
											}
											loading={isGeneratingAiSlug}
											disabled={isGeneratingSlug}
											aria-disabled={isUrlMissing || isGenerating}
											aria-label={aiSlugTooltip}
											className={disabledButtonClassName}
										>
											<Icon name='pencil-sparkles' className='size-4' />
										</Button>
									}
								/>
							</ButtonGroup.Root>

							<Tooltip.Root handle={slugTooltipHandle}>
								{({ payload }) => (
									<Tooltip.Popup animated>
										<Tooltip.Viewport className='tooltip-viewport-animated'>
											{payload as string}
										</Tooltip.Viewport>
									</Tooltip.Popup>
								)}
							</Tooltip.Root>
						</Tooltip.Provider>
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
