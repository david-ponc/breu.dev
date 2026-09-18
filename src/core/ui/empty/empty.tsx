import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';
import { tv, type VariantProps } from '#/core/lib/tv';

const emptyMediaVariants = tv({
	base: [
		'flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
	],
	defaultVariants: {
		variant: 'default',
	},
	variants: {
		variant: {
			default: 'bg-transparent',
			icon: [
				"relative flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card not-dark:bg-clip-padding text-foreground shadow-sm/5 [&_svg:not([class*='size-'])]:size-4.5",
				'before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-md)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]',
			],
		},
	},
});

export function EmptyRoot({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance px-6 py-12 text-center md:py-20',
				className,
			)}
			data-slot='empty'
			{...props}
		/>
	);
}

export function EmptyHeader({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			className={cn('flex max-w-sm flex-col items-center text-center', className)}
			data-slot='empty-header'
			{...props}
		/>
	);
}

export function EmptyMedia({
	className,
	variant = 'default',
	...props
}: ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
	return (
		<div
			className={cn('relative mb-6', className)}
			data-slot='empty-media'
			data-variant={variant}
		>
			{variant === 'icon' && (
				<>
					<div
						aria-hidden='true'
						className={cn(
							emptyMediaVariants({ variant }),
							'pointer-events-none absolute bottom-px origin-bottom-left -translate-x-0.75 -rotate-12 scale-84 shadow-none',
						)}
					/>
					<div
						aria-hidden='true'
						className={cn(
							emptyMediaVariants({ variant }),
							'pointer-events-none absolute bottom-px origin-bottom-right translate-x-0.75 rotate-12 scale-84 shadow-none',
						)}
					/>
				</>
			)}
			<div className={cn(emptyMediaVariants({ variant }))} {...props} />
		</div>
	);
}

export function EmptyTitle({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			className={cn('font-heading font-semibold text-xl', className)}
			data-slot='empty-title'
			{...props}
		/>
	);
}

export function EmptyDescription({ className, ...props }: ComponentProps<'p'>) {
	return (
		<p
			className={cn(
				'text-muted-foreground text-sm [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4 [[data-slot=empty-title]+&]:mt-1',
				className,
			)}
			data-slot='empty-description'
			{...props}
		/>
	);
}

export function EmptyContent({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm',
				className,
			)}
			data-slot='empty-content'
			{...props}
		/>
	);
}

export const Empty = {
	Content: EmptyContent,
	Description: EmptyDescription,
	Header: EmptyHeader,
	Media: EmptyMedia,
	Root: EmptyRoot,
	Title: EmptyTitle,
};
