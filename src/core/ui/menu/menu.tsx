import { Menu as BaseMenu } from '@base-ui/react/menu';

import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';

function MenuRoot({ ...props }: BaseMenu.Root.Props) {
	return <BaseMenu.Root data-slot='dropdown-menu' {...props} />;
}

function MenuPortal({ ...props }: BaseMenu.Portal.Props) {
	return <BaseMenu.Portal data-slot='dropdown-menu-portal' {...props} />;
}

function MenuTrigger({ ...props }: BaseMenu.Trigger.Props) {
	return <BaseMenu.Trigger {...props} data-slot='dropdown-menu-trigger' />;
}

function MenuPopup({
	align = 'start',
	alignOffset = 0,
	side = 'bottom',
	sideOffset = 4,
	collisionAvoidance,

	className,
	...props
}: BaseMenu.Popup.Props &
	Pick<
		BaseMenu.Positioner.Props,
		'align' | 'alignOffset' | 'side' | 'sideOffset' | 'collisionAvoidance'
	>) {
	return (
		<BaseMenu.Portal>
			<BaseMenu.Positioner
				className='isolate z-50 outline-none'
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
				collisionAvoidance={collisionAvoidance}
			>
				<BaseMenu.Popup
					data-slot='dropdown-menu-content'
					className={cn(
						'z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-lg bg-popover text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10 duration-100',
						'data-ending-style:scale-90 data-starting-style:scale-90 data-ending-style:opacity-0 data-starting-style:opacity-0',
						className,
					)}
					{...props}
				>
					{props.children}
				</BaseMenu.Popup>
			</BaseMenu.Positioner>
		</BaseMenu.Portal>
	);
}

function MenuGroup({ ...props }: BaseMenu.Group.Props) {
	return <BaseMenu.Group data-slot='dropdown-menu-group' {...props} />;
}

function MenuLabel({
	className,
	inset,
	...props
}: BaseMenu.GroupLabel.Props & {
	inset?: boolean;
}) {
	return (
		<BaseMenu.GroupLabel
			data-slot='dropdown-menu-label'
			data-inset={inset}
			className={cn(
				'whitespace-nowrap px-1.5 py-1 font-medium text-muted-foreground text-xs data-inset:pl-7',
				className,
			)}
			{...props}
		/>
	);
}

function MenuItem({
	className,
	inset,
	variant = 'default',
	...props
}: BaseMenu.Item.Props & {
	inset?: boolean;
	variant?: 'default' | 'destructive';
}) {
	return (
		<BaseMenu.Item
			data-slot='dropdown-menu-item'
			data-inset={inset}
			data-variant={variant}
			className={cn(
				'group/dropdown-menu-item relative inset-shadow-t-px inset-shadow-white/32 flex select-none items-center gap-1.5 whitespace-nowrap rounded-none px-2 py-2.5 text-muted-foreground text-sm outline-hidden',
				'focus:bg-secondary focus:text-foreground not-data-[variant=destructive]:focus:text-accent-foreground active:bg-outline-active',
				"not-data-disabled:cursor-pointer data-disabled:pointer-events-none data-inset:pl-7 data-[variant=destructive]:text-destructive data-disabled:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[variant=destructive]:*:[svg]:text-destructive",
				className,
			)}
			{...props}
		/>
	);
}

function MenuSub({ ...props }: BaseMenu.SubmenuRoot.Props) {
	return <BaseMenu.SubmenuRoot data-slot='dropdown-menu-sub' {...props} />;
}

function MenuSubTrigger({
	className,
	inset,
	children,
	...props
}: BaseMenu.SubmenuTrigger.Props & {
	inset?: boolean;
}) {
	return (
		<BaseMenu.SubmenuTrigger
			data-slot='dropdown-menu-sub-trigger'
			data-inset={inset}
			className={cn(
				"flex select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-open:bg-accent data-popup-open:bg-accent data-inset:pl-7 data-open:text-accent-foreground data-popup-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children}
			<Icon name='chevron-right' className='ml-auto' />
		</BaseMenu.SubmenuTrigger>
	);
}

function MenuSubPopup({
	align = 'start',
	alignOffset = -3,
	side = 'right',
	sideOffset = 0,
	className,
	...props
}: React.ComponentProps<typeof MenuPopup>) {
	return (
		<MenuPopup
			data-slot='dropdown-menu-sub-content'
			className={cn(
				'data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-auto min-w-24 rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in',
				className,
			)}
			align={align}
			alignOffset={alignOffset}
			side={side}
			sideOffset={sideOffset}
			{...props}
		/>
	);
}

function MenuCheckboxItem({
	className,
	children,
	checked,
	inset,
	...props
}: BaseMenu.CheckboxItem.Props & {
	inset?: boolean;
}) {
	return (
		<BaseMenu.CheckboxItem
			data-slot='dropdown-menu-checkbox-item'
			data-inset={inset}
			className={cn(
				"relative flex cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-7 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			checked={checked}
			{...props}
		>
			<span
				className='pointer-events-none absolute right-2 flex items-center justify-center'
				data-slot='dropdown-menu-checkbox-item-indicator'
			>
				<BaseMenu.CheckboxItemIndicator>
					<Icon name='check' />
				</BaseMenu.CheckboxItemIndicator>
			</span>
			{children}
		</BaseMenu.CheckboxItem>
	);
}

function MenuRadioGroup({ ...props }: BaseMenu.RadioGroup.Props) {
	return <BaseMenu.RadioGroup data-slot='dropdown-menu-radio-group' {...props} />;
}

function MenuRadioItem({
	className,
	children,
	inset,
	...props
}: BaseMenu.RadioItem.Props & {
	inset?: boolean;
}) {
	return (
		<BaseMenu.RadioItem
			data-slot='dropdown-menu-radio-item'
			data-inset={inset}
			className={cn(
				"relative flex cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-disabled:pointer-events-none data-inset:pl-7 data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			<span
				className='pointer-events-none absolute right-2 flex items-center justify-center'
				data-slot='dropdown-menu-radio-item-indicator'
			>
				<BaseMenu.RadioItemIndicator>
					<Icon name='check' />
				</BaseMenu.RadioItemIndicator>
			</span>
			{children}
		</BaseMenu.RadioItem>
	);
}

function MenuSeparator({ className, ...props }: BaseMenu.Separator.Props) {
	return (
		<BaseMenu.Separator
			data-slot='dropdown-menu-separator'
			className={cn('-mx-1 h-px bg-border', className)}
			{...props}
		/>
	);
}

function MenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			data-slot='dropdown-menu-shortcut'
			className={cn(
				'ml-auto text-muted-foreground text-xs tracking-widest group-focus/dropdown-menu-item:text-accent-foreground',
				className,
			)}
			{...props}
		/>
	);
}

export {
	MenuCheckboxItem,
	MenuGroup,
	MenuItem,
	MenuLabel,
	MenuPopup,
	MenuPortal,
	MenuRadioGroup,
	MenuRadioItem,
	MenuRoot,
	MenuSeparator,
	MenuShortcut,
	MenuSub,
	MenuSubPopup,
	MenuSubTrigger,
	MenuTrigger,
};
