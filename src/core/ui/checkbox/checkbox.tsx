import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type { ComponentProps, SVGProps } from 'react';

import { cn } from '#/core/lib/cn';

const CHECK_PATH = 'M3 9L6 12L13 5';

export function Checkbox({ className, ...props }: BaseCheckbox.Root.Props) {
	return (
		<BaseCheckbox.Root
			className={cn(
				'relative inline-flex size-[calc(--spacing(4.5)-1px)] shrink-0 rounded-sm bg-popover text-white shadow-xs ring ring-border transition-[color,background-color] duration-150 ease-out focus-visible:transition-none',
				'inset-shadow-t-px inset-shadow-white/32',
				'data-checked:bg-info data-checked:ring-info-foreground/70',
				'data-indeterminate:bg-info data-indeterminate:ring-info-foreground/70',
				className,
			)}
			data-slot='checkbox'
			{...props}
		>
			<BaseCheckbox.Indicator
				className='absolute -inset-px grid place-items-center data-unchecked:opacity-0'
				data-slot='checkbox-indicator'
				keepMounted
				render={(indicatorProps, state) => (
					<span {...(indicatorProps as ComponentProps<'span'>)}>
						<CheckboxIndicatorIcon indeterminate={state.indeterminate} />
					</span>
				)}
			/>
		</BaseCheckbox.Root>
	);
}

function CheckboxIndicatorIcon({ indeterminate }: { indeterminate: boolean }) {
	return indeterminate ? (
		<IndeterminateIcon aria-hidden className='mt-px mr-px size-3' strokeWidth={2} />
	) : (
		<CheckIcon aria-hidden className='size-3' strokeWidth={2.1} />
	);
}

function CheckIcon({ strokeWidth = 1.5, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg width='16' height='16' viewBox='0 0 16 16' fill='none' {...props}>
			<path
				d={CHECK_PATH}
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
}

function IndeterminateIcon({ strokeWidth = 1.5, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg width='16' height='16' viewBox='0 0 16 16' fill='none' {...props}>
			<path
				d='M4 8H14'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
}

export { BaseCheckbox };
