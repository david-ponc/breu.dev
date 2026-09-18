import type { SVGProps } from 'react';

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox='0 0 16 16' fill='currentColor' {...props}>
			<path
				fillRule='evenodd'
				d='M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z'
				clipRule='evenodd'
			/>
		</svg>
	);
}
