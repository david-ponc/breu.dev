import { barX, defineChart } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { type ReactNode, useId, useMemo } from 'react';

import type { NamedCount } from '#/contexts/analytics/visits/domain/link-stats';

import { formatShare } from './format';

const MAX_ITEMS = 8;
const ROW_HEIGHT = 36;
const VISIBLE_ROWS = 5;
const BAR_RADIUS = 8;
const BAR_BASE = 'color-mix(in oklab, var(--foreground) 10%, transparent)';
const BAR_TINT = 'color-mix(in oklab, var(--foreground) 14%, transparent)';
const BAR_LINE_WIDTH = 1;
const BAR_LINE_GAP = 0.1;
const BAR_LINE_INSET = BAR_LINE_GAP + BAR_LINE_WIDTH;
const CHART_ANIMATION = { duration: 280, easing: 'ease-out' } as const;

interface BreakdownChartProps {
	title: string;
	items: NamedCount[];
	formatKey?: (key: string) => string;
	leading?: (key: string) => ReactNode;
	initialWidth?: number;
}

export function BreakdownChart({
	title,
	items,
	formatKey = String,
	leading,
	initialWidth,
}: BreakdownChartProps) {
	const id = `breakdown-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const rows = useMemo(() => {
		const total = items.reduce((sum, item) => sum + item.count, 0);
		return items.slice(0, MAX_ITEMS).map((item) => ({
			key: item.key,
			label: formatKey(item.key),
			count: item.count,
			share: formatShare(item.count, total),
		}));
	}, [formatKey, items]);
	const maximum = rows[0]?.count ?? 1;
	const keys = useMemo(() => rows.map((row) => row.key), [rows]);
	const definition = useMemo(
		() =>
			defineChart({
				svgAnimation: CHART_ANIMATION,
				guides: false,
				margin: 0,
				clip: false,
				pointer: false,
				keyboard: false,
				focusRing: false,
				marks: [
					barX(rows, {
						id: 'base',
						x: 'count',
						x1: 0,
						y: 'key',
						key: 'key',
						fill: `url(#${id}-bar)`,
						stroke: BAR_BASE,
						strokeWidth: 1,
						radius: BAR_RADIUS,
					}),
					barX(rows, {
						id: 'sheen',
						x: 'count',
						x1: 0,
						y: 'key',
						key: 'key',
						fill: 'none',
						stroke: `url(#${id}-bar-sheen)`,
						strokeWidth: BAR_LINE_WIDTH,
						inset: BAR_LINE_INSET,
						radius: BAR_RADIUS - BAR_LINE_INSET,
					}),
				],
				gradients: [
					{
						id: `${id}-bar`,
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 1,
						stops: [
							{ offset: 0, color: BAR_TINT },
							{ offset: 1, color: BAR_BASE },
						],
					},
					{
						id: `${id}-bar-sheen`,
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 1,
						stops: [
							{ offset: 0, color: 'white', opacity: 0.32 },
							{ offset: 0.06, color: 'white', opacity: 0.32 },
							{ offset: 0.1, color: 'white', opacity: 0 },
							{ offset: 1, color: 'white', opacity: 0 },
						],
					},
				],
				scales: {
					x: {
						scale: scaleLinear().domain([0, maximum]),
						axis: false,
					},
					y: {
						scale: () =>
							scaleBand<string>().domain(keys).paddingInner(0.22).paddingOuter(0.11),
						axis: false,
					},
				},
			}),
		[id, keys, maximum, rows],
	);
	const height = rows.length * ROW_HEIGHT;
	const scrollable = rows.length > VISIBLE_ROWS;

	return (
		<div
			className={scrollable ? 'scroll-fade-b scroll-fade-b-5 overflow-y-auto' : undefined}
			style={scrollable ? { maxHeight: VISIBLE_ROWS * ROW_HEIGHT } : undefined}
		>
			<div className='relative pr-11'>
				<Chart
					definition={definition}
					height={height}
					initialWidth={initialWidth}
					className='w-full'
					ariaLabel={`${title}: ${rows.map((row) => `${row.label} ${row.share}`).join(', ')}`}
				/>
				<ul
					className='pointer-events-none absolute inset-0 flex flex-col pr-11'
					aria-hidden
				>
					{rows.map((row) => (
						<li
							key={row.key}
							className='flex items-center gap-2 px-2.5 text-sm'
							style={{ height: ROW_HEIGHT }}
						>
							{leading?.(row.key)}
							<span className='min-w-0 truncate'>{row.label}</span>
						</li>
					))}
				</ul>
				<ul
					className='pointer-events-none absolute inset-y-0 right-0 flex w-11 flex-col'
					aria-hidden
				>
					{rows.map((row) => (
						<li
							key={row.key}
							className='flex items-center justify-end text-right font-medium text-sm tabular-nums'
							style={{ height: ROW_HEIGHT }}
						>
							{row.share}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export function CountryFlag(code: string) {
	if (!/^[A-Za-z]{2}$/.test(code)) return null;

	return (
		<img
			src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
			alt=''
			width={16}
			height={12}
			className='h-3 w-4 shrink-0 rounded-xs outline outline-black/10 dark:outline-white/10'
		/>
	);
}
