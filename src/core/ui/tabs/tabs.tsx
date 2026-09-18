import { Tabs as BaseTabs } from '@base-ui/react/tabs';

import { cn } from '#/core/lib/cn';

function TabsRoot({ className, ...props }: BaseTabs.Root.Props) {
	return <BaseTabs.Root className={cn('flex flex-col', className)} {...props} />;
}

function TabsList({ className, ...props }: BaseTabs.List.Props) {
	return (
		<BaseTabs.List
			data-slot='tabs-list'
			className={cn('relative flex w-fit items-center gap-1', className)}
			{...props}
		/>
	);
}

function TabsTab({ className, ...props }: BaseTabs.Tab.Props) {
	return (
		<BaseTabs.Tab
			data-slot='tabs-tab'
			className={cn(
				'relative inline-flex h-9 items-center justify-center rounded-lg px-3 font-medium text-muted-foreground text-sm outline-none transition-colors',
				'not-disabled:cursor-pointer not-disabled:hover:bg-black/4 hover:text-foreground data-active:text-foreground',
				'focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring',
				'disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

function TabsIndicator({ className, ...props }: BaseTabs.Indicator.Props) {
	return (
		<BaseTabs.Indicator
			data-slot='tabs-indicator'
			className={cn(
				'absolute -bottom-0.75 left-(--active-tab-left) h-0.75 w-(--active-tab-width) rounded-t bg-primary-foreground',
				className,
			)}
			{...props}
		/>
	);
}

function TabsPanel({ className, ...props }: BaseTabs.Panel.Props) {
	return (
		<BaseTabs.Panel
			data-slot='tabs-panel'
			className={cn('outline-none', className)}
			{...props}
		/>
	);
}

export const Tabs = {
	Indicator: TabsIndicator,
	List: TabsList,
	Panel: TabsPanel,
	Root: TabsRoot,
	Tab: TabsTab,
};

export { BaseTabs };
