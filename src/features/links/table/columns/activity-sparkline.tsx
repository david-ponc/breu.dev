import { areaY, defineChart, dot, lineY } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { useMemo } from 'react';

import type { LinkActivity } from '#/contexts/brevis/links/domain/link-summary';

const WIDTH = 160;
const HEIGHT = 32;
const STROKE_WIDTH = 1.5;
const COLOR = 'var(--primary)';

export function ActivitySparkline({ activity }: { activity: LinkActivity[] }) {
	const definition = useMemo(() => {
		const points = activity.map((point, index) => ({ ...point, index }));
		return defineChart({
			marks: [
				areaY(points, {
					x: 'index',
					y: 'clicks',
					y1: 0,
					fill: 'url(#activity-fill)',
				}),
				lineY(points, {
					x: 'index',
					y: 'clicks',
					stroke: COLOR,
					strokeWidth: STROKE_WIDTH,
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
					scale: scaleLinear,
					domain: [0, Math.max(1, ...activity.map((point) => point.clicks))],
				},
			},
			gradients: [
				{
					id: 'activity-fill',
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1,
					stops: [
						{ offset: 0, color: COLOR, opacity: 0.3 },
						{ offset: 1, color: COLOR, opacity: 0 },
					],
				},
			],
			guides: false,
			margin: { top: 4, right: 2, bottom: 2, left: 2 },
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
