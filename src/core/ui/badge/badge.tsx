import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';

import { cn } from '#/core/lib/cn';
import { tv, type VariantProps } from '#/core/lib/tv';

const badgeVariants = tv({
	base: [
		'group/badge relative inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border border-transparent px-2 py-0.5 font-medium text-xs',
		'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!',
		'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
		'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
	],
	variants: {
		variant: {
			default: 'bg-secondary text-secondary-foreground [a,button]:hover:bg-secondary/80',
			error:
				'bg-destructive/14 text-destructive dark:bg-destructive/16 [a,button]:hover:bg-destructive/20',
			info: 'bg-info/14 text-info-foreground dark:bg-info/16 [a,button]:hover:bg-info/20',
			success:
				'bg-success/14 text-success-foreground dark:bg-success/16 [a,button]:hover:bg-success/20',
			warning:
				'bg-warning/14 text-warning-foreground dark:bg-warning/16 [a,button]:hover:bg-warning/20',
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
