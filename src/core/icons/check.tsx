import type { SVGProps } from 'react';

export function CheckIcon({ strokeWidth = 1.5, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg width='16' height='16' viewBox='0 0 16 16' fill='none' {...props}>
			<path
				d='M3 9L6 12L13 5'
				stroke='currentColor'
				strokeWidth={strokeWidth}
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
}
