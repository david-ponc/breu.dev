import { Input as BaseInput } from '@base-ui/react/input';

import { cn } from '#/core/lib/cn';

function Input({ className, type, ...props }: BaseInput.Props) {
	return (
		<BaseInput
			type={type}
			data-slot='input'
			className={cn(
				'h-9 w-full min-w-0 rounded-lg border border-input bg-field-surface px-2.5 py-1 text-base outline-none transition-colors placeholder:text-muted-foreground',
				'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-field-disabled-surface disabled:opacity-50 aria-invalid:border-field-invalid-border aria-invalid:ring-input-invalid-ring',
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
