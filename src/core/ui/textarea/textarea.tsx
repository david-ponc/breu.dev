import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot='textarea'
			className={cn(
				'field-sizing-content flex min-h-16 w-full rounded-lg border border-input bg-field-surface px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-field-disabled-surface disabled:opacity-50 aria-invalid:border-field-invalid-border aria-invalid:ring-1 aria-invalid:ring-textarea-invalid-ring md:text-sm',
				className,
			)}
			autoComplete='off'
			autoCorrect='off'
			spellCheck={false}
			{...props}
		/>
	);
}

export { Textarea };
