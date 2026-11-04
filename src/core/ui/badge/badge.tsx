import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';

import { cn } from '#/core/lib/cn';
import { tv, type VariantProps } from '#/core/lib/tv';

const badgeVariants = tv({
	base: [
		'group/badge relative inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border border-transparent px-2 py-0.5 font-medium text-xs',
		'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!',
		'focus:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring',
		'aria-invalid:border-destructive aria-invalid:ring-badge-invalid-ring',
		'inset-highlight-40 inset-shadow-t-px',
	],
	variants: {
		variant: {
			default: 'bg-secondary text-secondary-foreground [a,button]:hover:bg-secondary/80',
			error: 'bg-badge-error-surface text-destructive [a,button]:hover:bg-destructive/20',
			info: 'bg-badge-info-surface text-info-foreground [a,button]:hover:bg-info/20',
			success:
				'bg-badge-success-surface text-success-foreground [a,button]:hover:bg-success/20',
			warning:
				'bg-badge-warning-surface text-warning-foreground [a,button]:hover:bg-warning/20',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

interface BadgeProps extends useRender.ComponentProps<'span'> {
	variant?: VariantProps<typeof badgeVariants>['variant'];
}

function Badge({ className, variant = 'default', render, ...props }: BadgeProps) {
	return useRender({
		defaultTagName: 'span',
		props: mergeProps<'span'>(
			{ className: cn(badgeVariants({ variant }), className) },
			props,
		),
		render,
		state: { slot: 'badge', variant },
	});
}

export { Badge, badgeVariants };
