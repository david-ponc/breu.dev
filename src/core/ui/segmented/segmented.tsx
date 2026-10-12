import { mergeProps, useRender } from '@base-ui/react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';

import { cn } from '#/core/lib/cn';

function SegmentedRoot({ className, ...props }: BaseTabs.Root.Props) {
	return <BaseTabs.Root className={cn('flex', className)} {...props} />;
}

function SegmentedList({ className, ...props }: BaseTabs.List.Props) {
	return (
		<BaseTabs.List
			data-slot='segmented-list'
			className={cn(
				'relative isolate inline-flex h-9 w-fit items-center gap-0.5 rounded-xl bg-foreground/6 p-1',
				className,
			)}
			{...props}
		/>
	);
}

const ITEM_BASE =
	'relative z-10 inline-flex h-7 items-center justify-center rounded-lg px-3 font-medium text-muted-foreground text-sm outline-none data-active:text-foreground';
const ITEM_INTERACTIVE =
	'not-disabled:hit-area-y-1.5 transition-[color,scale] not-disabled:cursor-pointer not-disabled:hover:text-foreground not-disabled:active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
const ITEM_DECORATIVE = 'pointer-events-none';

interface SegmentedItemProps extends Omit<BaseTabs.Tab.Props, 'className' | 'render'> {
	className?: string;
	render?: useRender.RenderProp;
	/**
	 * Renders the item as a non-interactive presentational element: no pointer
	 * interactions, no focus ring and no roving tab stop. Useful when the
	 * control is used inside a decorative product preview.
	 */
	decorative?: boolean;
}

function SegmentedItem({ className, decorative, render, ...props }: SegmentedItemProps) {
	const defaultProps = {
		'data-slot': 'segmented-item',
		className: cn(ITEM_BASE, decorative ? ITEM_DECORATIVE : ITEM_INTERACTIVE, className),
	};

	const element = useRender({
		defaultTagName: 'button',
		render,
		props: mergeProps<'button'>(
			defaultProps,
			decorative ? { 'aria-hidden': true, tabIndex: -1 } : undefined,
		),
	});

	return (
		<BaseTabs.Tab
			{...props}
			nativeButton={decorative ? false : props.nativeButton}
			render={element}
		/>
	);
}

function SegmentedIndicator({ className, ...props }: BaseTabs.Indicator.Props) {
	return (
		<BaseTabs.Indicator
			data-slot='segmented-indicator'
			className={cn(
				'absolute inset-y-1 left-(--active-tab-left) w-(--active-tab-width) rounded-lg bg-popover shadow-sm ring-1 ring-foreground/5',
				'transition-[left,width] duration-200 ease-out motion-reduce:transition-none',
				className,
			)}
			{...props}
		/>
	);
}

export const Segmented = {
	Indicator: SegmentedIndicator,
	Item: SegmentedItem,
	List: SegmentedList,
	Root: SegmentedRoot,
};

export { BaseTabs as BaseSegmented };
