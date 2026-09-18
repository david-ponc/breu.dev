import { type CSSProperties, useId } from 'react';

import { cn } from '#/core/lib/cn';

interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
	cellSize?: number;
	fade?: number;
}

export function GridPattern({
	cellSize = 24,
	fade = 42,
	className,
	style,
	...props
}: GridPatternProps) {
	const id = useId();

	return (
		<svg
			aria-hidden='true'
			style={
				{
					'--gp-fade': `${fade}%`,
					...style,
				} as CSSProperties
			}
			className={cn(
				'absolute inset-0 h-full w-full stroke-border/40',
				'mask-[radial-gradient(var(--gp-fade)_var(--gp-fade)_at_center,white,transparent)]',
				className,
			)}
			{...props}
		>
			<defs>
				<pattern id={id} width={cellSize} height={cellSize} patternUnits='userSpaceOnUse'>
					<path d={`M.5 ${cellSize}V.5H${cellSize}`} fill='none' strokeWidth='1' />
				</pattern>
			</defs>
			<rect width='100%' height='100%' fill={`url(#${id})`} />
		</svg>
	);
}
