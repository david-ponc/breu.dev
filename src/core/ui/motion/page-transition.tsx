import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';

export function PageTransition({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-stagger
			data-stagger-isolate
			className={cn('contents', className)}
			{...props}
		/>
	);
}
