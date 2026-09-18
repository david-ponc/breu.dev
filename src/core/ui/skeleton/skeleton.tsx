import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='skeleton'
			className={cn(
				'loading-skeleton relative isolate block overflow-hidden rounded bg-muted',
				className,
			)}
			{...props}
		/>
	);
}
