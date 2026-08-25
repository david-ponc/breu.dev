import { mergeProps, useRender } from '@base-ui/react';
import type { ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import { cn } from '#/core/lib/cn';

function CardRoot({
	className,
	size = 'default',
	render,
	...props
}: useRender.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
	const defaultProps = {
		className: cn(
			'group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-card-foreground text-sm ring-1 ring-foreground/10 has-[>img:first-child]:pt-0 has-data-[slot=card-footer]:pb-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
			className,
		),
		'data-slot': 'card',
		'data-size': size,
	};

	return useRender({
		defaultTagName: 'div',
		props: mergeProps<'div'>(defaultProps, props),
		render,
	});
}

function CardHeader({ className, ...props }: ComponentProps<'header'>) {
	return (
		<header
			data-slot='card-header'
			className={cn(
				'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: ComponentProps<'p'>) {
	return (
		<p
			data-slot='card-title'
			className={cn(
				'font-medium text-base leading-snug group-data-[size=sm]/card:text-sm',
				className,
			)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: ComponentProps<'p'>) {
	return (
		<p
			data-slot='card-description'
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: ComponentProps<'menu'>) {
	return (
		<menu
			data-slot='card-action'
			className={cn(
				'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
				className,
			)}
			{...props}
		/>
	);
}

function CardPanel({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-content'
			className={cn('px-4 group-data-[size=sm]/card:px-3', className)}
			{...props}
		/>
	);
}

const cardFooterVariants = tv({
	base: 'flex items-center rounded-b-xl p-4 group-data-[size=sm]/card:p-3',
	variants: {
		variant: {
			default: 'border-t border-t-border bg-muted/50',
			ghost: 'bg-card',
		},
	},
});

function CardFooter({
	className,
	variant = 'default',
	...props
}: ComponentProps<'footer'> & VariantProps<typeof cardFooterVariants>) {
	return (
		<footer
			data-slot='card-footer'
			className={cn(cardFooterVariants({ variant, className }))}
			{...props}
		/>
	);
}

export const Card = {
	Action: CardAction,
	Description: CardDescription,
	Footer: CardFooter,
	Header: CardHeader,
	Panel: CardPanel,
	Root: CardRoot,
	Title: CardTitle,
};
