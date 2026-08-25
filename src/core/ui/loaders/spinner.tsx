import { type CSSProperties, useMemo } from 'react';

import { cn } from '#/core/lib/cn';

interface Props {
	size?: 'sm' | 'md' | 'lg' | number;
	className?: string;
}

export function Spinner({ size: initialSize = 'md', className }: Props) {
	const size = calculateSize(initialSize);
	const lines = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

	return (
		<div
			style={{ '--spinner-size': size } as CSSProperties}
			className={cn('grid size-(--spinner-size) place-items-center', className)}
			data-spinner
		>
			<div className='relative top-1/2 left-1/2 size-(--spinner-size)'>
				{lines.map((lineId, i) => (
					<div
						key={lineId}
						className='absolute top-[-3.9%] left-[-10%] h-[8%] w-[24%] animate-spinner-line rounded-[1px] bg-current'
						style={{
							transform: `rotate(${i * 30}deg) translate(146%)`,
							animationDelay: `${-1100 + i * 100}ms`,
						}}
					/>
				))}
			</div>
		</div>
	);
}

function calculateSize(size: 'sm' | 'md' | 'lg' | number): string {
	if (typeof size === 'number') return `${size / 16}rem`;
	if (size === 'sm') return '1rem';
	if (size === 'md') return '1.5rem';
	if (size === 'lg') return '2rem';
	return '1rem';
}
