import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';

function AvatarRoot({
	className,
	size = 'default',
	...props
}: BaseAvatar.Root.Props & {
	size?: 'default' | 'sm' | 'lg';
}) {
	return (
		<BaseAvatar.Root
			data-slot='avatar'
			data-size={size}
			className={cn(
				'group/avatar relative flex size-8 shrink-0 select-none rounded-lg after:absolute after:inset-0 after:rounded-lg after:border after:border-border after:mix-blend-darken data-[size=lg]:size-9 data-[size=sm]:size-6 dark:after:mix-blend-lighten',
				className,
			)}
			{...props}
		/>
	);
}

function AvatarImage({ className, ...props }: BaseAvatar.Image.Props) {
	return (
		<BaseAvatar.Image
			data-slot='avatar-image'
			className={cn('aspect-square size-full rounded-lg object-cover', className)}
			{...props}
		/>
	);
}

function AvatarFallback({ className, ...props }: BaseAvatar.Fallback.Props) {
	return (
		<BaseAvatar.Fallback
			data-slot='avatar-fallback'
			className={cn(
				'flex size-full items-center justify-center rounded-lg bg-muted text-muted-foreground text-sm group-data-[size=sm]/avatar:text-xs',
				className,
			)}
			{...props}
		/>
	);
}

function AvatarBadge({ className, ...props }: ComponentProps<'span'>) {
	return (
		<span
			data-slot='avatar-badge'
			className={cn(
				'absolute right-0 bottom-0 z-10 inline-flex select-none items-center justify-center rounded-lg bg-primary text-primary-foreground bg-blend-color ring-2 ring-background',
				'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
				'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
				'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
				className,
			)}
			{...props}
		/>
	);
}

function AvatarGroup({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='avatar-group'
			className={cn(
				'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
				className,
			)}
			{...props}
		/>
	);
}

function AvatarGroupCount({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='avatar-group-count'
			className={cn(
				'relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground text-sm ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-9 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
				className,
			)}
			{...props}
		/>
	);
}

export const Avatar = {
	Root: AvatarRoot,
	Image: AvatarImage,
	Fallback: AvatarFallback,
	Badge: AvatarBadge,
	Group: AvatarGroup,
	GroupCount: AvatarGroupCount,
};
