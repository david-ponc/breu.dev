import { areaY, d3Curve, defineChart, dot, lineY } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { curveMonotoneX } from 'd3-shape';
import { useMemo } from 'react';

import type { LinkActivity } from '#/contexts/brevis/links/domain/link-summary';

const WIDTH = 160;
const HEIGHT = 32;
const STROKE_WIDTH = 2;
const COLOR = 'var(--primary)';
const FILL_ID = 'activity-fill';
const monotone = d3Curve(curveMonotoneX);

export function ActivitySparkline({ activity }: { activity: LinkActivity[] }) {
	const definition = useMemo(() => {
		const points = activity.map((point, index) => ({ ...point, index }));
		const values = activity.map((point) => point.clicks);
		const minimum = values.length ? Math.min(...values) : 0;
		const maximum = values.length ? Math.max(...values) : 1;
		const padding = Math.max((maximum - minimum) * 0.16, 0.1);
		const baseline = minimum - padding;

		return defineChart({
			marks: [
				areaY(points, {
					x: 'index',
					y: 'clicks',
					y1: baseline,
					fill: `url(#${FILL_ID})`,
					fillOpacity: 1,
					curve: monotone,
				}),
				lineY(points, {
					x: 'index',
					y: 'clicks',
					stroke: COLOR,
					strokeWidth: STROKE_WIDTH,
					curve: monotone,
				}),
				dot(points.length === 1 ? points : [], {
					x: 'index',
					y: 'clicks',
					fill: COLOR,
					r: 2,
				}),
			],
			scales: {
				x: {
					scale: scaleLinear,
					domain: points.length > 1 ? [0, points.length - 1] : [-1, 1],
				},
				y: {
					scale: scaleLinear().domain([baseline, maximum + padding]),
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
						{ offset: 0, color: COLOR, opacity: 0.34 },
						{ offset: 0.58, color: COLOR, opacity: 0.13 },
						{ offset: 1, color: COLOR, opacity: 0.015 },
					],
				},
			],
			guides: false,
			clip: false,
			pointer: false,
			keyboard: false,
		});
	}, [activity]);
	const total = activity.reduce((sum, point) => sum + point.clicks, 0);

	return (
		<Chart
			definition={definition}
			width={WIDTH}
			height={HEIGHT}
			className='shrink-0'
			ariaLabel={
				activity.length
					? `${total} clicks over the last ${activity.length} days (UTC)`
					: 'No activity data'
			}
		/>
	);
}
