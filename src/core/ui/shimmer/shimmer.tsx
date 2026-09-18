import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';

export function Shimmer({ children, className, ...props }: ComponentProps<'span'>) {
	return (
		<span
			className={cn('loading-shimmer inline-block text-muted-foreground', className)}
			{...props}
		>
			{children}
		</span>
	);
}
