import { barX, defineChart } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type ReactNode, useMemo } from 'react';

import type { NamedCount } from '#/contexts/analytics/visits/domain/link-stats';
import { Card } from '#/core/ui/card';

import { formatCountry, formatDevice, formatShare } from './format';
import { linkStatsQueryOptions } from './query';
import type { ActivityRange } from './range';

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

interface LinkDetailBreakdownsProps {
	linkId: string;
	userId: string;
	range: ActivityRange;
}

export function LinkDetailBreakdowns({
	linkId,
	userId,
	range,
}: LinkDetailBreakdownsProps) {
	const { data: stats } = useSuspenseQuery(linkStatsQueryOptions(userId, linkId, range));

	return (
		<div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
			<BreakdownCard
				title='Countries'
				items={stats.countries}
				formatKey={formatCountry}
				leading={CountryFlag}
				empty='No location data yet.'
			/>
			<BreakdownCard title='Devices' items={stats.devices} formatKey={formatDevice} />
			<BreakdownCard title='Browsers' items={stats.browsers} />
			<BreakdownCard title='Operating systems' items={stats.os} />
			<BreakdownCard title='Referrers' items={stats.referrers} />
		</div>
	);
}

function BreakdownCard({
	title,
	items,
	formatKey = String,
	leading,
	empty = 'No data yet.',
}: {
	title: string;
	items: NamedCount[];
	formatKey?: (key: string) => string;
	leading?: (key: string) => ReactNode;
	empty?: string;
}) {
	return (
		<Card.Root size='sm'>
			<Card.Header>
				<Card.Title>{title}</Card.Title>
			</Card.Header>
			<Card.Panel>
				{items.length === 0 ? (
					<p className='py-6 text-muted-foreground text-sm'>{empty}</p>
				) : (
					<BreakdownChart
						title={title}
						items={items}
						formatKey={formatKey}
						leading={leading}
					/>
				)}
			</Card.Panel>
		</Card.Root>
	);
}

function BreakdownChart({
	title,
	items,
	formatKey,
	leading,
}: {
	title: string;
	items: NamedCount[];
	formatKey: (key: string) => string;
	leading?: (key: string) => ReactNode;
}) {
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
						fill: 'url(#breakdown-bar)',
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
						stroke: 'url(#breakdown-bar-sheen)',
						strokeWidth: BAR_LINE_WIDTH,
						inset: BAR_LINE_INSET,
						radius: BAR_RADIUS - BAR_LINE_INSET,
					}),
				],
				gradients: [
					{
						id: 'breakdown-bar',
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
						id: 'breakdown-bar-sheen',
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
		[keys, maximum, rows],
	);
	const height = rows.length * ROW_HEIGHT;
	const scrollable = rows.length > VISIBLE_ROWS;

	return (
		<div
			className={
				scrollable
					? 'mask-[linear-gradient(to_bottom,black_calc(100%-1.25rem),transparent)] overflow-y-auto'
					: undefined
			}
			style={scrollable ? { maxHeight: VISIBLE_ROWS * ROW_HEIGHT } : undefined}
		>
			<div className='relative pr-11'>
				<Chart
					definition={definition}
					height={height}
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

function CountryFlag(code: string) {
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
