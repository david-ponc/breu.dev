import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

import { cn } from '#/core/lib/cn';

export const TooltipCreateHandle = BaseTooltip.createHandle;

function TooltipProvider({ delay = 0, ...props }: BaseTooltip.Provider.Props) {
	return <BaseTooltip.Provider data-slot='tooltip-provider' delay={delay} {...props} />;
}

function TooltipRoot({ ...props }: BaseTooltip.Root.Props) {
	return <BaseTooltip.Root data-slot='tooltip' {...props} />;
}

function TooltipTrigger({ className, ...props }: BaseTooltip.Trigger.Props) {
	return (
		<BaseTooltip.Trigger
			data-slot='tooltip-trigger'
			className={cn(
				'outline-none focus-visible:ring-2 focus-visible:ring-ring',
				className,
			)}
			{...props}
		/>
	);
}

function TooltipPopup({
	className,
	animated = false,
	side = 'top',
	sideOffset = 4,
	align = 'center',
	alignOffset = 0,
	children,
	...props
}: BaseTooltip.Popup.Props &
	Pick<BaseTooltip.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'> & {
		animated?: boolean;
	}) {
	return (
		<BaseTooltip.Portal>
			<BaseTooltip.Positioner
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
				className={cn(
					'z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) data-ending-style:-z-50 data-starting-style:-z-50',
					animated && 'tooltip-positioner-animated',
				)}
				data-slot='tooltip-positioner'
			>
				<BaseTooltip.Popup
					data-slot='tooltip-content'
					className={cn(
						'inset-shadow-t-px inset-shadow-white/32 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-2 py-1 text-background text-xs will-change-auto',
						'duration-150 ease-out data-ending-style:scale-96 data-starting-style:scale-96 data-ending-style:opacity-0 data-starting-style:opacity-0 data-instant:transition-none',
						'data-[side=bottom]:data-ending-style:-translate-y-1 data-[side=bottom]:data-starting-style:-translate-y-1',
						'data-[side=top]:data-ending-style:translate-y-1 data-[side=top]:data-starting-style:translate-y-1',
						'data-[side=left]:data-ending-style:translate-x-1 data-[side=left]:data-starting-style:translate-x-1',
						'data-[side=right]:data-ending-style:-translate-x-1 data-[side=right]:data-starting-style:-translate-x-1',
						'has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm',
						animated &&
							'tooltip-popup-animated h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] p-0',
						className,
					)}
					{...props}
				>
					{children}
				</BaseTooltip.Popup>
			</BaseTooltip.Positioner>
		</BaseTooltip.Portal>
	);
}

function TooltipViewport({ className, ...props }: BaseTooltip.Viewport.Props) {
	return (
		<BaseTooltip.Viewport
			data-slot='tooltip-viewport'
			className={cn(className)}
			{...props}
		/>
	);
}

export const Tooltip = {
	Provider: TooltipProvider,
	Root: TooltipRoot,
	Trigger: TooltipTrigger,
	Popup: TooltipPopup,
	Viewport: TooltipViewport,
	createHandle: TooltipCreateHandle,
};
