import { mergeProps, useRender } from '@base-ui/react';
import type { ButtonHTMLAttributes } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { cn } from '#/core/lib/cn';
import { tv } from '#/core/lib/tv';
import { Spinner } from '#/core/ui/loaders/spinner';

export const buttonVariants = tv({
	base: [
		'relative isolate inline-flex shrink-0 origin-bottom items-center justify-center gap-2 font-medium md:text-sm',
		'select-none whitespace-nowrap rounded-lg border border-transparent',
		'not-disabled:cursor-pointer not-disabled:active:scale-99',
		'disabled:pointer-events-none not-data-loading:disabled:opacity-50',
		'data-disabled:pointer-events-none not-data-loading:data-disabled:opacity-50',
		'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring in-data-[slot=card]:focus-visible:ring-offset-card',
		'[&_svg:not([class*="size-"])]:size-4',
	],
	variants: {
		variant: {
			default: [
				'inset-shadow-t-px/32 inset-shadow-white bg-primary text-primary-foreground hover:bg-primary/90 active:bg-default-active',
			],
			secondary: [
				'inset-shadow-t-px/32 inset-shadow-white bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary-active',
			],
			outline: [
				'inset-shadow-t-px/32 inset-shadow-white border-border bg-transparent text-foreground hover:bg-secondary active:bg-outline-active',
			],
			ghost: ['bg-transparent text-foreground hover:bg-secondary active:bg-ghost-active'],
			link: [
				'bg-transparent text-foreground underline underline-offset-4 not-disabled:hover:underline-offset-[5px] not-disabled:[:active,[data-pressed]]:underline-offset-3',
			],
			destructive: [
				'inset-shadow-t-px/32 inset-shadow-white bg-destructive text-white hover:bg-destructive/90 active:bg-destructive-active',
			],
			'destructive-outline': [
				'inset-shadow-t-px/32 inset-shadow-white border border-border bg-transparent text-destructive-foreground hover:bg-destructive/10 active:bg-destructive-outline-active',
			],
		},
		size: {
			default: [
				'h-9 px-[calc(--spacing(3)-1px)]',
				'has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				'not-disabled:[:active,[data-pressed]]:pt-[calc(--spacing(2)+1px)] not-disabled:[:active,[data-pressed]]:pb-[calc(--spacing(2)-1px)]',
			],
			sm: [
				'h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)]',
				'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
				'not-disabled:[:active,[data-pressed]]:pt-[calc(--spacing(1.5)+1px)] not-disabled:[:active,[data-pressed]]:pb-[calc(--spacing(1.5)-1px)]',
			],
			xs: [
				"h-6 gap-1 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),10px)] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
			],
			icon: [
				'size-9',
				'not-disabled:[:active,[data-pressed]]:pt-[calc(--spacing(2)+1px)] not-disabled:[:active,[data-pressed]]:pb-[calc(--spacing(2)-1px)]',
			],
			'icon-sm': [
				'size-8',
				'not-disabled:[:active,[data-pressed]]:pt-[calc(--spacing(1.5)+1px)] not-disabled:[:active,[data-pressed]]:pb-[calc(--spacing(1.5)-1px)]',
			],
			'icon-xs': [
				'size-7 rounded-md',
				'not-disabled:[:active,[data-pressed]]:pt-[calc(--spacing(1)+1px)] not-disabled:[:active,[data-pressed]]:pb-[calc(--spacing(1)-1px)]',
			],
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
	},
});

export interface ButtonProps
	extends useRender.ComponentProps<'button'>,
		VariantProps<typeof buttonVariants> {
	loading?: boolean;
}

export function Button({
	className,
	variant,
	size,
	render,
	children,
	loading = false,
	disabled: disabledProp,
	...props
}: ButtonProps) {
	const isDisabled = Boolean(disabledProp || loading);
	const typeValue: ButtonHTMLAttributes<HTMLButtonElement>['type'] = render
		? undefined
		: 'button';

	const defaultProps = {
		children: (
			<>
				{loading ? <span className='invisible contents'>{children}</span> : children}
				{loading ? (
					<Spinner
						className='pointer-events-none absolute'
						data-slot='button-loading-indicator'
						size={16}
					/>
				) : null}
			</>
		),
		className: cn(buttonVariants({ size, variant, className })),
		'aria-disabled': loading || undefined,
		'data-loading': loading ? '' : undefined,
		'data-disabled': isDisabled ? '' : undefined,
		'data-slot': 'button',
		disabled: isDisabled,
		type: typeValue,
	};

	return useRender({
		defaultTagName: 'button',
		props: mergeProps<'button'>(defaultProps, props),
		render,
	});
}
