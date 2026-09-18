import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentType, SVGProps } from 'react';

import { AlertIcon } from '#/core/icons/alert';
import { CheckCircleIcon } from '#/core/icons/check-circle';
import { CircleSlashIcon } from '#/core/icons/circle-slash';
import { InfoIcon } from '#/core/icons/info';
import { XMarkIcon } from '#/core/icons/x-mark';
import { cn } from '#/core/lib/cn';
import { Spinner } from '#/core/ui/loaders/spinner';

import { Button } from '../button';

export const toastManager = BaseToast.createToastManager();
export const anchoredToastManager = BaseToast.createToastManager();
export const useToastManager = BaseToast.useToastManager;

const STACKED_TRANSFORM =
	'translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))';
const STACKED_EXPANDED_TRANSFORM =
	'translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))';

const TYPE_ICONS = {
	success: CheckCircleIcon,
	error: CircleSlashIcon,
	warning: AlertIcon,
	info: InfoIcon,
} as const satisfies Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

const TYPE_ICON_COLOR = {
	success: 'text-success-foreground',
	error: 'text-destructive-foreground',
	warning: 'text-warning-foreground',
	info: 'text-info-foreground',
} as const;

function ToastProvider({ ...props }: BaseToast.Provider.Props) {
	return <BaseToast.Provider data-slot='toast-provider' {...props} />;
}

function ToastPortal({ ...props }: BaseToast.Portal.Props) {
	return <BaseToast.Portal data-slot='toast-portal' {...props} />;
}

function ToastViewport({ className, ...props }: BaseToast.Viewport.Props) {
	return (
		<BaseToast.Viewport data-slot='toast-viewport' className={cn(className)} {...props} />
	);
}

function ToastRoot({ className, ...props }: BaseToast.Root.Props) {
	return <BaseToast.Root data-slot='toast' className={cn(className)} {...props} />;
}

function ToastContent({ className, ...props }: BaseToast.Content.Props) {
	return (
		<BaseToast.Content data-slot='toast-content' className={cn(className)} {...props} />
	);
}

function ToastTitle({ className, ...props }: BaseToast.Title.Props) {
	return (
		<BaseToast.Title
			data-slot='toast-title'
			className={cn('font-medium text-sm', className)}
			{...props}
		/>
	);
}

function ToastDescription({ className, ...props }: BaseToast.Description.Props) {
	return (
		<BaseToast.Description
			data-slot='toast-description'
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		/>
	);
}

function ToastAction({
	className,
	render = <Button variant='outline' size='sm' />,
	...props
}: BaseToast.Action.Props) {
	return (
		<BaseToast.Action
			data-slot='toast-action'
			render={render}
			className={cn('shrink-0', className)}
			{...props}
		/>
	);
}

function ToastClose({ className, children, ...props }: BaseToast.Close.Props) {
	return (
		<BaseToast.Close
			data-slot='toast-close'
			aria-label='Close notification'
			render={<Button variant='ghost' size='icon-sm' />}
			className={cn(
				"relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
				className,
			)}
			{...props}
		>
			{children ?? <XMarkIcon />}
		</BaseToast.Close>
	);
}

function ToastPositioner({ className, ...props }: BaseToast.Positioner.Props) {
	return (
		<BaseToast.Positioner
			data-slot='toast-positioner'
			className={cn('z-[calc(1000-var(--toast-index))]', className)}
			{...props}
		/>
	);
}

function ToastArrow({ className, ...props }: BaseToast.Arrow.Props) {
	return (
		<BaseToast.Arrow
			data-slot='toast-arrow'
			className={cn(
				'relative block h-1.5 w-3 overflow-clip',
				'data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90',
				'data-[side=right]:left-[-9px] data-[side=right]:-rotate-90',
				'data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180',
				"before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:bg-foreground before:content-[''] before:[transform:translate(-50%,50%)_rotate(45deg)]",
				className,
			)}
			{...props}
		/>
	);
}

function ToastIcon({ type }: { type?: string }) {
	if (type === 'loading') {
		return (
			<span
				key='loading'
				data-slot='toast-icon'
				className='shrink-0 text-foreground starting:opacity-0 transition-opacity duration-150 ease-out'
			>
				<Spinner size={16} />
			</span>
		);
	}

	const Icon = type ? TYPE_ICONS[type as keyof typeof TYPE_ICONS] : undefined;
	if (!Icon) return null;

	return (
		<span
			key={type}
			data-slot='toast-icon'
			className={cn(
				'shrink-0 starting:opacity-0 transition-opacity duration-150 ease-out [&_svg]:size-4',
				TYPE_ICON_COLOR[type as keyof typeof TYPE_ICON_COLOR],
			)}
		>
			<Icon />
		</span>
	);
}

function StackedToastList() {
	const { toasts } = useToastManager();

	return toasts.map((toast) => (
		<ToastRoot
			key={toast.id}
			toast={toast}
			swipeDirection={['down', 'right']}
			className={cn(
				'absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] w-full origin-bottom select-none',
				'rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10',
				'h-(--height) outline-none focus-visible:ring-2 focus-visible:ring-ring',
				'[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--peek:0.75rem]',
				'[--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
				'[--offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]',
				`[transform:${STACKED_TRANSFORM}]`,
				'[transition:transform_400ms_cubic-bezier(0.22,1,0.36,1),opacity_400ms,height_150ms]',
				"after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
				'data-expanded:h-(--toast-height)',
				`data-expanded:[transform:${STACKED_EXPANDED_TRANSFORM}]`,
				'data-limited:opacity-0',
				'data-starting-style:[transform:translateY(150%)]',
				'data-ending-style:opacity-0',
				'[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]',
				'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
				'data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
				'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
				'data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
				'data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
				'data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
				'data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
				'data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
				`motion-reduce:[transition:opacity_200ms] motion-reduce:data-starting-style:[transform:${STACKED_TRANSFORM}] motion-reduce:data-ending-style:[transform:${STACKED_TRANSFORM}]`,
			)}
		>
			<ToastContent
				className={cn(
					'flex h-full items-center gap-3 overflow-hidden p-3',
					'transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]',
					'data-behind:opacity-0 data-expanded:opacity-100',
				)}
			>
				<ToastIcon type={toast.type} />
				<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
					<ToastTitle />
					<ToastDescription />
				</div>
				<ToastAction />
				<ToastClose />
			</ToastContent>
		</ToastRoot>
	));
}

function AnchoredToastList() {
	const { toasts } = useToastManager();

	return toasts.map((toast) => (
		<ToastPositioner key={toast.id} toast={toast}>
			<ToastRoot
				toast={toast}
				swipeDirection={[]}
				className={cn(
					'relative flex w-max origin-(--transform-origin) flex-col rounded-md bg-foreground px-2 py-1',
					'text-background text-xs outline-none',
					'duration-150 ease-out will-change-auto',
					'data-ending-style:scale-98 data-starting-style:scale-98',
					'data-ending-style:opacity-0 data-starting-style:opacity-0',
					'data-instant:transition-none',
					'focus-visible:ring-2 focus-visible:ring-ring',
				)}
			>
				<ToastArrow />
				<ToastContent>
					<ToastTitle className='text-background text-xs' />
					<ToastDescription className='text-background text-xs' />
				</ToastContent>
			</ToastRoot>
		</ToastPositioner>
	));
}

function StackedToaster() {
	return (
		<ToastProvider toastManager={toastManager} timeout={4000} limit={3}>
			<ToastPortal>
				<ToastViewport
					className={cn(
						'fixed z-[100] mx-auto w-auto outline-none',
						'inset-x-4 bottom-4',
						'sm:right-8 sm:bottom-8 sm:left-auto sm:mx-0 sm:w-[22.5rem]',
					)}
				>
					<StackedToastList />
				</ToastViewport>
			</ToastPortal>
		</ToastProvider>
	);
}

function AnchoredToaster() {
	return (
		<ToastProvider toastManager={anchoredToastManager} timeout={1500}>
			<ToastPortal>
				<ToastViewport className='z-[100] outline-none'>
					<AnchoredToastList />
				</ToastViewport>
			</ToastPortal>
		</ToastProvider>
	);
}

export function Toaster() {
	return (
		<>
			<StackedToaster />
			<AnchoredToaster />
		</>
	);
}

export const Toast = {
	Action: ToastAction,
	Arrow: ToastArrow,
	Close: ToastClose,
	Content: ToastContent,
	Description: ToastDescription,
	Portal: ToastPortal,
	Positioner: ToastPositioner,
	Provider: ToastProvider,
	Root: ToastRoot,
	Title: ToastTitle,
	Viewport: ToastViewport,
};
