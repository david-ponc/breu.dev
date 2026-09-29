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

function SegmentedItem({ className, ...props }: BaseTabs.Tab.Props) {
	return (
		<BaseTabs.Tab
			data-slot='segmented-item'
			className={cn(
				'relative z-10 inline-flex h-7 items-center justify-center rounded-lg px-3 font-medium text-muted-foreground text-sm outline-none',
				'not-disabled:hit-area-y-1.5 transition-[color,scale]',
				'not-disabled:cursor-pointer not-disabled:hover:text-foreground not-disabled:active:scale-[0.97]',
				'data-active:text-foreground',
				'focus-visible:ring-2 focus-visible:ring-ring',
				'disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			{...props}
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
