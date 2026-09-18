import { mergeProps, useRender } from '@base-ui/react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { cn } from '#/core/lib/cn';

import { Button } from '../button';

function DialogRoot({ ...props }: BaseDialog.Root.Props) {
	return <BaseDialog.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({ ...props }: BaseDialog.Trigger.Props) {
	return <BaseDialog.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({ ...props }: BaseDialog.Portal.Props) {
	return <BaseDialog.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({ ...props }: BaseDialog.Close.Props) {
	return <BaseDialog.Close data-slot='dialog-close' {...props} />;
}

function DialogOverlay({ className, ...props }: BaseDialog.Backdrop.Props) {
	return (
		<BaseDialog.Backdrop
			data-slot='dialog-overlay'
			className={cn(
				'fixed inset-0 isolate z-50 bg-black/10 duration-200 ease-out data-ending-style:duration-150 supports-backdrop-filter:backdrop-blur-xs',
				'transform-gpu transition-opacity will-change-auto',
				'data-ending-style:opacity-0 data-starting-style:opacity-0',
				className,
			)}
			{...props}
		/>
	);
}

export function DialogViewport({ className, ...props }: BaseDialog.Viewport.Props) {
	return (
		<BaseDialog.Viewport
			className={cn(
				'fixed inset-0 z-50 grid grid-rows-[1fr_auto_1fr] justify-items-center p-4',
				className,
			)}
			data-slot='dialog-viewport'
			{...props}
		/>
	);
}

function DialogPopup({ className, children, ...props }: BaseDialog.Popup.Props & {}) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogViewport>
				<BaseDialog.Popup
					data-slot='dialog-popup'
					className={cn(
						'relative row-start-2 flex max-h-full min-h-0 flex-col overflow-hidden sm:max-w-md sm:p-0.5',
						'z-50 w-full max-w-lg scale-[calc(1-0.1*var(--nested-dialogs))] rounded-2xl bg-muted text-sm outline-none ring-1 ring-foreground/10 data-nested-dialog-open:blur-[2px] data-nested-dialog-open:after:absolute data-nested-dialog-open:after:inset-0 data-nested-dialog-open:after:rounded-[inherit] data-nested-dialog-open:after:bg-black/12',
						'transform-gpu transition-[opacity,transform,scale] duration-200 ease-out will-change-auto data-ending-style:duration-150',
						'data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0',
						'motion-reduce:scale-100 motion-reduce:transition-opacity motion-reduce:data-ending-style:scale-100 motion-reduce:data-starting-style:scale-100',
						className,
					)}
					{...props}
				>
					{children}
				</BaseDialog.Popup>
			</DialogViewport>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<header
			data-slot='dialog-header'
			className={cn(
				'flex flex-col gap-1 rounded-t-[inherit] border border-b-0 bg-card p-4',
				className,
			)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<'div'> & {
	showCloseButton?: boolean;
}) {
	return (
		<footer
			data-slot='dialog-footer'
			className={cn(
				'flex flex-col-reverse gap-2 p-2.5 sm:flex-row sm:justify-between',
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<BaseDialog.Close render={<Button variant='outline'>Close</Button>} />
			)}
		</footer>
	);
}

function DialogTitle({ className, ...props }: BaseDialog.Title.Props) {
	return (
		<BaseDialog.Title
			data-slot='dialog-title'
			className={cn('cn-font-heading font-medium text-base leading-none', className)}
			{...props}
		/>
	);
}

function DialogDescription({ className, ...props }: BaseDialog.Description.Props) {
	return (
		<BaseDialog.Description
			data-slot='dialog-description'
			className={cn(
				'text-muted-foreground text-sm *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
				className,
			)}
			{...props}
		/>
	);
}

function DialogPanel({
	className,
	render,
	...props
}: useRender.ComponentProps<'div'> & {}) {
	const defaultProps = {
		className: cn(
			'relative min-h-0 flex-1 overflow-hidden rounded-b-xl border-x border-b bg-card p-4 pt-0',
			className,
		),
		'data-slot': 'dialog-panel',
	};

	return (
		<>
			{useRender({
				defaultTagName: 'div',
				props: mergeProps<'div'>(defaultProps, props),
				render,
			})}
		</>
	);
}

export const Dialog = {
	createHandle: BaseDialog.createHandle,
	Close: DialogClose,
	Description: DialogDescription,
	Footer: DialogFooter,
	Header: DialogHeader,
	Overlay: DialogOverlay,
	Panel: DialogPanel,
	Popup: DialogPopup,
	Portal: DialogPortal,
	Root: DialogRoot,
	Title: DialogTitle,
	Trigger: DialogTrigger,
};
