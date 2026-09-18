import type { SVGProps } from 'react';

export function AccountIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg x='0px' y='0px' width='16px' height='16px' viewBox='0 0 18 18' {...props}>
			<circle
				cx='9'
				cy='4.5'
				r='2.75'
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='1.5'
			></circle>
			<path
				d='M13.762,15.516c.86-.271,1.312-1.221,.947-2.045-.97-2.191-3.159-3.721-5.709-3.721s-4.739,1.53-5.709,3.721c-.365,.825,.087,1.774,.947,2.045,1.225,.386,2.846,.734,4.762,.734s3.537-.348,4.762-.734Z'
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='1.5'
			></path>
		</svg>
	);
}
