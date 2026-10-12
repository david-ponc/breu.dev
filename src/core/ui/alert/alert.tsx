import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';
import { tv, type VariantProps } from '#/core/lib/tv';

const alertVariants = tv({
	base: [
		'group/alert grid w-full min-w-0 grid-cols-[0_minmax(0,1fr)] gap-y-1 rounded-lg p-3 text-sm ring-1 ring-inset',
		'has-[>svg]:grid-cols-[auto_minmax(0,1fr)] has-[>svg]:gap-x-2.5 [&>svg]:pointer-events-none [&>svg]:col-start-1 [&>svg]:row-span-2 [&>svg]:row-start-1 [&>svg]:mt-0.5 [&>svg]:size-4',
	],
	variants: {
		variant: {
			default: 'bg-muted/50 text-foreground ring-foreground/10',
			info: 'bg-info/10 text-info-foreground ring-info/20 dark:bg-info/16',
		},
	},
	defaultVariants: { variant: 'default' },
});

interface AlertRootProps extends useRender.ComponentProps<'div'> {
	variant?: VariantProps<typeof alertVariants>['variant'];
}

function AlertRoot({ className, variant = 'default', render, ...props }: AlertRootProps) {
	return useRender({
		defaultTagName: 'div',
		props: mergeProps<'div'>(
			{ role: 'note', className: cn(alertVariants({ variant }), className) },
			props,
		),
		render,
		state: { slot: 'alert', variant },
	});
}

function AlertTitle({ className, ...props }: ComponentProps<'p'>) {
	return (
		<p
			data-slot='alert-title'
			className={cn('col-start-2 min-w-0 font-medium leading-snug', className)}
			{...props}
		/>
	);
}

function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-description'
			className={cn(
				'col-start-2 min-w-0 text-pretty leading-relaxed [&_a:focus-visible]:rounded-sm [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-current [&_a:focus-visible]:outline-offset-2 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4',
				className,
			)}
			{...props}
		/>
	);
}

export const Alert = {
	Root: AlertRoot,
	Title: AlertTitle,
	Description: AlertDescription,
};
