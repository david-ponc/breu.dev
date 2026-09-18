import type { SVGProps } from 'react';

export function DoorOutIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg x='0px' y='0px' width='16px' height='16px' viewBox='0 0 18 18' {...props}>
			<path
				d='M11.75,5.75V3.25c0-.552-.448-1-1-1H4.25c-.552,0-1,.448-1,1V14.75c0,.552,.448,1,1,1h6.5c.552,0,1-.448,1-1v-2.5'
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='1.5'
			></path>
			<polyline
				points='14.5 6.25 17.25 9 14.5 11.75'
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='1.5'
			></polyline>
			<line
				x1='17.25'
				y1='9'
				x2='11.25'
				y2='9'
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='1.5'
			></line>
			<path
				d='M3.457,2.648l3.321,2.059c.294,.182,.473,.504,.473,.85v6.887c0,.346-.179,.667-.473,.85l-3.322,2.06'
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='1.5'
			></path>
		</svg>
	);
}
