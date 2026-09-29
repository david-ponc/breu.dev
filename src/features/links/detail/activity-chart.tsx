import { areaY, crosshair, d3Curve, defineChart, lineY } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { portal } from '@tanstack/charts/tooltip/portal';
import { useSuspenseQuery } from '@tanstack/react-query';
import { curveMonotoneX } from 'd3-shape';
import { startTransition, useMemo } from 'react';

import { Card } from '#/core/ui/card';
import { Segmented } from '#/core/ui/segmented';

import { formatCount, formatDate } from './format';
import { linkStatsQueryOptions } from './query';
import { ACTIVITY_RANGES, type ActivityRange, activityRangeLabel } from './range';

const COLOR = 'var(--activity-line)';
const FILL_ID = 'detail-activity-fill';
const CHART_ANIMATION = { duration: 280, easing: 'ease-out' } as const;
const monotone = d3Curve(curveMonotoneX);

interface LinkDetailActivityChartProps {
	linkId: string;
	userId: string;
	range: ActivityRange;
	onRangeChange: (range: ActivityRange) => void;
}

export function LinkDetailActivityChart({
	linkId,
	userId,
	range,
	onRangeChange,
}: LinkDetailActivityChartProps) {
	const { data: stats } = useSuspenseQuery(linkStatsQueryOptions(userId, linkId, range));
	const definition = useMemo(() => {
		const points = stats.activity;
		const values = points.map((point) => point.clicks);
		const maximum = values.length ? Math.max(...values, 1) : 1;

		const base = defineChart({
			marks: [
				areaY(points, {
					x: 'date',
					y: 'clicks',
					y1: 0,
					fill: `url(#${FILL_ID})`,
					curve: monotone,
				}),
				lineY(points, {
					x: 'date',
					y: 'clicks',
					stroke: COLOR,
					strokeWidth: 2,
					curve: monotone,
				}),
				crosshair({
					x: { strokeDasharray: '4 4', label: false },
					y: false,
					marker: {
						radius: 4,
						fill: COLOR,
						stroke: 'var(--popover)',
						strokeWidth: 2,
					},
				}),
			],
			scales: {
				x: {
					scale: () => scalePoint<string>().padding(0.1),
				},
				y: {
					scale: scaleLinear().domain([0, maximum]),
					nice: true,
					grid: true,
				},
			},
			gradients: [
				{
					id: FILL_ID,
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1,
					stops: [
						{ offset: 0, color: COLOR, opacity: 0.3 },
						{ offset: 0.58, color: COLOR, opacity: 0.12 },
						{ offset: 1, color: COLOR, opacity: 0.02 },
					],
				},
			],
		});

		return defineChart(base, {
			svgAnimation: CHART_ANIMATION,
			focus: 'nearest-x',
			maxFocusDistance: Number.POSITIVE_INFINITY,
			focusRing: false,
			tooltip: {
				use: tooltip,
				portal,
				className: 'activity-tooltip',
				anchor: 'point',
				placement: ['top', 'right', 'left', 'bottom'],
				offset: 12,
				format: (point) =>
					`${formatDate(point.datum.date)} · ${formatCount(point.datum.clicks)} clicks`,
			},
		});
	}, [stats.activity]);

	return (
		<Card.Root className='h-full'>
			<Card.Header className='flex flex-row items-start justify-between gap-3'>
				<div>
					<Card.Title>Activity</Card.Title>
					<Card.Description>Clicks over time (UTC)</Card.Description>
				</div>
				<Segmented.Root
					value={range}
					onValueChange={(value) =>
						startTransition(() => onRangeChange(value as ActivityRange))
					}
				>
					<Segmented.List aria-label='Activity range'>
						{ACTIVITY_RANGES.map((value) => (
							<Segmented.Item key={value} value={value}>
								{activityRangeLabel(value)}
							</Segmented.Item>
						))}
						<Segmented.Indicator />
					</Segmented.List>
				</Segmented.Root>
			</Card.Header>
			<Card.Panel>
				{stats.activity.length === 0 ? (
					<p className='py-16 text-center text-muted-foreground text-sm'>
						No clicks in this period.
					</p>
				) : (
					<Chart
						definition={definition}
						height={260}
						className='w-full'
						ariaLabel='Clicks over time. Hover or use arrow keys to inspect a day.'
					/>
				)}
			</Card.Panel>
		</Card.Root>
	);
}
