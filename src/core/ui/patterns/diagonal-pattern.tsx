import { useId } from 'react';

import { cn } from '#/core/lib/cn';

type DiagonalPatternProps = React.SVGProps<SVGSVGElement> & {
	lineOpacity?: number;
};

export function DiagonalPattern({
	lineOpacity = 0.15,
	className,
	...props
}: DiagonalPatternProps) {
	const id = useId();
	const patternId = `${id}-pattern`;
	const clipId = `${id}-clip`;

	return (
		<svg
			aria-hidden='true'
			className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
			{...props}
		>
			<defs>
				<pattern id={patternId} width='48' height='48' patternUnits='userSpaceOnUse'>
					<rect width='48' height='48' fill='var(--card)' />
					<g
						clipPath={`url(#${clipId})`}
						opacity={lineOpacity}
						stroke='var(--foreground)'
					>
						<path d='M36.5 -1.5L-13.5 48.5' />
						<path d='M60.5 22.5L10.5 72.5' />
						<path d='M60.5 -1.5L10.5 48.5' />
						<path d='M37 -26L-13 24' />
						<path d='M48.5 -1.5L-1.5 48.5' />
						<path d='M72.5 22.5L22.5 72.5' />
						<path d='M72.5 -1.5L22.5 48.5' />
						<path d='M49 -26L-19.5 42.5' />
					</g>
				</pattern>
				<clipPath id={clipId}>
					<rect width='48' height='48' />
				</clipPath>
			</defs>
			<rect width='100%' height='100%' fill={`url(#${patternId})`} />
		</svg>
	);
}
