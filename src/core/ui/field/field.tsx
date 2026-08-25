import { Field as BaseField } from '@base-ui/react/field';
import { AnimatePresence, type MotionProps, motion } from 'motion/react';
import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';
import { tv, type VariantProps } from '#/core/lib/tv';

import { Separator } from '../separator';

const fieldVariants = tv({
	base: ['group/field flex w-full gap-1 data-invalid:text-destructive'],
	variants: {
		orientation: {
			vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
			horizontal:
				'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
			responsive:
				'@md/field-group:flex-row flex-col @md/field-group:items-center *:w-full @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
		},
	},
	defaultVariants: {
		orientation: 'vertical',
	},
});

export function FieldRoot({
	className,
	orientation = 'vertical',
	...props
}: BaseField.Root.Props & VariantProps<typeof fieldVariants>) {
	return (
		<BaseField.Root
			role='group'
			data-slot='field'
			data-orientation={orientation}
			className={cn(fieldVariants({ orientation }), className)}
			{...props}
		/>
	);
}

export function FieldItem({ className, ...props }: BaseField.Item.Props) {
	return (
		<BaseField.Item
			data-slot='field-item'
			className={cn(
				'group/field-item flex flex-1 flex-col gap-0.5 leading-snug',
				className,
			)}
			{...props}
		/>
	);
}

export function FieldLabel({ className, ...props }: BaseField.Label.Props) {
	return (
		<BaseField.Label
			data-slot='field-label'
			className={cn(
				'group/field-label peer/field-label flex w-fit gap-2 leading-snug has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-data-checked:border-primary/30 has-data-checked:bg-primary/5 *:data-[slot=field]:p-2.5 group-data-[disabled=true]/field:opacity-50 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10',
				'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
				'has-[+_[data-slot=field-description]]:-mb-1',
				className,
			)}
			{...props}
		/>
	);
}

export function FieldDescription({ className, ...props }: BaseField.Description.Props) {
	return (
		<BaseField.Description
			data-slot='field-description'
			className={cn(
				'text-left font-normal text-muted-foreground text-sm leading-normal group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5',
				'[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
				className,
			)}
			{...props}
		/>
	);
}

const BaseFieldError = motion.create(BaseField.Error);

export function FieldError({
	className,
	match,
	children,
	...props
}: BaseField.Error.Props & MotionProps) {
	return (
		<AnimatePresence>
			{match && (
				<BaseFieldError
					key='field-error'
					role='alert'
					data-slot='field-error'
					match={match}
					initial={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
					animate={{ opacity: 1, height: 'auto', filter: 'blur(0)' }}
					exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
					className={cn('text-destructive-foreground text-xs', className)}
					{...props}
				>
					{children}
				</BaseFieldError>
			)}
		</AnimatePresence>
	);
}

export function FieldSeparator({ children, className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='field-separator'
			data-content={!!children}
			className={cn('relative -my-2 h-5 bg-background', className)}
			{...props}
		>
			<Separator className='absolute inset-0 top-1/2' />
			{children && (
				<span
					className='relative mx-auto block w-fit bg-inherit px-2 text-muted-foreground'
					data-slot='field-separator-content'
				>
					{children}
				</span>
			)}
		</div>
	);
}
