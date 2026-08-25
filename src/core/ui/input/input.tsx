import { Input as BaseInput } from '@base-ui/react/input';

import { cn } from '#/core/lib/cn';

function Input({ className, type, ...props }: BaseInput.Props) {
	return (
		<BaseInput
			type={type}
			data-slot='input'
			className={cn(
				'h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors placeholder:text-muted-foreground',
				'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:disabled:bg-input/80',
				'md:text-sm',
				className,
			)}
			autoComplete='off'
			autoCorrect='off'
			spellCheck={false}
			{...props}
		/>
	);
}

export { BaseInput, Input };
