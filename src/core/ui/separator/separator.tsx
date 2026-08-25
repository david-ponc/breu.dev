import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type { ReactElement } from 'react';

import { cn } from '#/core/lib/cn';

export function Separator({
	className,
	orientation = 'horizontal',
	...props
}: BaseSeparator.Props): ReactElement {
	return (
		<BaseSeparator
			className={cn(
				"shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
				className,
			)}
			data-slot='separator'
			orientation={orientation}
			{...props}
		/>
	);
}

export { BaseSeparator };
