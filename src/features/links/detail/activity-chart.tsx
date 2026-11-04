import {
	areaY,
	type ChartRenderContext,
	crosshair,
	d3Curve,
	defineChart,
	lineY,
	ruleY,
} from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { renderChartSvg } from '@tanstack/charts/svg';
import { tooltip } from '@tanstack/charts/tooltip';
import { portal } from '@tanstack/charts/tooltip/portal';
import { useSuspenseQuery } from '@tanstack/react-query';
import { curveMonotoneX, line as d3Line } from 'd3-shape';
import { startTransition, useCallback, useId, useMemo, useRef } from 'react';

import type { LinkActivity } from '#/contexts/analytics/visits/domain/link-stats';
import { Card } from '#/core/ui/card';
import { Segmented } from '#/core/ui/segmented';

import { formatCount, formatDate } from './format';
import { linkStatsQueryOptions } from './query';
import { ACTIVITY_RANGES, type ActivityRange, activityRangeLabel } from './range';

const COLOR = 'var(--primary)';
const CHART_ANIMATION = {
	duration: 280,
	easing: 'ease-out',
	respectReducedMotion: true,
} as const;
const LINE_DRAW_DURATION = 280;
const LINE_DRAW_EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';
const LINE_MORPH_DURATION = 280;
const LINE_MORPH_SAMPLES = 96;
const monotone = d3Curve(curveMonotoneX);
type LinePoint = { x: number; y: number };
const morphLine = d3Line<LinePoint>()
	.x((point) => point.x)
	.y((point) => point.y)
	.curve(curveMonotoneX);

function samplePath(svg: SVGSVGElement, d: string): LinePoint[] {
	const path = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute('d', d);
	path.setAttribute('visibility', 'hidden');
	svg.append(path);

	try {
		if (
			typeof path.getTotalLength !== 'function' ||
			typeof path.getPointAtLength !== 'function'
		) {
			return [];
		}
		const length = path.getTotalLength();
		if (!Number.isFinite(length) || length <= 0) return [];

		return Array.from({ length: LINE_MORPH_SAMPLES }, (_, index) => {
			const point = path.getPointAtLength((length * index) / (LINE_MORPH_SAMPLES - 1));
			return { x: point.x, y: point.y };
		});
	} finally {
		path.remove();
	}
}

function pathFromPoints(points: LinePoint[]): string | null {
	return morphLine(points);
}

function hasCompatiblePathStructure(previous: string, next: string): boolean {
	const numbers = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
	return previous.replace(numbers, '#') === next.replace(numbers, '#');
}

interface ActivityChartProps {
	activity: LinkActivity[];
	interactive?: boolean;
	height?: number;
	initialWidth?: number;
	ariaLabel?: string;
}

export function ActivityChart({
	activity,
	interactive = true,
	height = 260,
	initialWidth,
	ariaLabel,
}: ActivityChartProps) {
	const chartId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const fillId = `activity-fill-${chartId}`;
	const gradientId = `activity-gradient-${chartId}`;
	const resolvedAriaLabel =
		ariaLabel ??
		(interactive
			? 'Clicks over time. Hover or use arrow keys to inspect a day.'
			: 'Example activity over time.');
	const lastDrawnActivity = useRef<LinkActivity[] | null>(null);
	const lineAnimations = useRef(new WeakMap<SVGPathElement, Animation>());
	const lineMorphFrame = useRef<number | null>(null);
	const lineMorphPoints = useRef<LinePoint[] | null>(null);
	const lastLinePath = useRef<string | null>(null);
	const isMorphingLine = useRef(false);
	const renderSvg = useMemo(
		() =>
			(
				scene: Parameters<typeof renderChartSvg>[0],
				options: Parameters<typeof renderChartSvg>[1],
			) =>
				renderChartSvg(scene, options).replace(
					'</svg>',
					`<defs><pattern id="${fillId}" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" fill="none" stroke="${COLOR}" stroke-width="1.75" stroke-opacity="0.52"/></pattern></defs></svg>`,
				),
		[fillId],
	);
	const onRender = useCallback(
		({ svg, scene }: ChartRenderContext<LinkActivity, string, number>) => {
			const path = svg.querySelector<SVGPathElement>('.ts-chart__line path');
			if (!path) return;

			if (lastDrawnActivity.current === activity) {
				if (isMorphingLine.current && lineMorphPoints.current) {
					const d = pathFromPoints(lineMorphPoints.current);
					if (d) path.setAttribute('d', d);
				}
				return;
			}

			const isInitialRender = lastDrawnActivity.current === null;
			const wasMorphingLine = isMorphingLine.current;
			lastDrawnActivity.current = activity;

			const reduceMotion =
				typeof window === 'undefined' ||
				window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
			lineAnimations.current.get(path)?.cancel();
			lineAnimations.current.delete(path);
			path.style.removeProperty('stroke-dasharray');
			path.style.removeProperty('stroke-dashoffset');

			if (lineMorphFrame.current !== null) {
				window.cancelAnimationFrame(lineMorphFrame.current);
				lineMorphFrame.current = null;
			}
			isMorphingLine.current = false;

			const template = svg.ownerDocument.createElement('template');
			template.innerHTML = renderSvg(scene, { ariaLabel: resolvedAriaLabel });
			const targetD = template.content
				.querySelector<SVGPathElement>('.ts-chart__line path')
				?.getAttribute('d');
			if (!targetD) return;

			const targetPoints = samplePath(svg, targetD);
			if (targetPoints.length === 0) return;

			if (isInitialRender) {
				lineMorphPoints.current = targetPoints;
				lastLinePath.current = targetD;
				if (
					reduceMotion ||
					typeof path.animate !== 'function' ||
					typeof path.getTotalLength !== 'function'
				) {
					return;
				}

				const length = path.getTotalLength();
				if (!Number.isFinite(length) || length <= 0) return;

				path.style.strokeDasharray = `${length}`;
				const animation = path.animate(
					[{ strokeDashoffset: `${length}px` }, { strokeDashoffset: '0px' }],
					{
						duration: LINE_DRAW_DURATION,
						easing: LINE_DRAW_EASING,
						fill: 'both',
					},
				);
				lineAnimations.current.set(path, animation);
				animation.onfinish = () => {
					path.style.removeProperty('stroke-dasharray');
					path.style.removeProperty('stroke-dashoffset');
					lineAnimations.current.delete(path);
				};
				return;
			}

			const fromPoints =
				lineMorphPoints.current ?? samplePath(svg, path.getAttribute('d') ?? '');
			if (reduceMotion || fromPoints.length !== targetPoints.length) {
				path.setAttribute('d', targetD);
				lineMorphPoints.current = targetPoints;
				lastLinePath.current = targetD;
				isMorphingLine.current = false;
				return;
			}
			if (
				!wasMorphingLine &&
				lastLinePath.current !== null &&
				hasCompatiblePathStructure(lastLinePath.current, targetD)
			) {
				lineMorphPoints.current = targetPoints;
				lastLinePath.current = targetD;
				return;
			}

			lineMorphPoints.current = fromPoints;
			lastLinePath.current = targetD;
			isMorphingLine.current = true;
			const startedAt = performance.now();
			const animateMorph = (now: number) => {
				const progress = Math.min(1, (now - startedAt) / LINE_MORPH_DURATION);
				const eased = 1 - (1 - progress) ** 3;
				const points = fromPoints.map((point, index) => {
					const target = targetPoints[index];
					return {
						x: point.x + (target.x - point.x) * eased,
						y: point.y + (target.y - point.y) * eased,
					};
				});
				lineMorphPoints.current = points;
				const d = pathFromPoints(points);
				if (d) path.setAttribute('d', d);

				if (progress < 1) {
					lineMorphFrame.current = window.requestAnimationFrame(animateMorph);
				} else {
					path.setAttribute('d', targetD);
					lineMorphPoints.current = targetPoints;
					lineMorphFrame.current = null;
					isMorphingLine.current = false;
				}
			};
			lineMorphFrame.current = window.requestAnimationFrame(animateMorph);
		},
		[activity, renderSvg, resolvedAriaLabel],
	);
	const definition = useMemo(() => {
		const values = activity.map((point) => point.clicks);
		const maximum = values.length ? Math.max(...values, 1) : 1;

		const base = defineChart({
			marks: [
				areaY(activity, {
					x: 'date',
					y: 'clicks',
					y1: 0,
					fill: `url(#${gradientId})`,
					fillOpacity: 1,
					curve: monotone,
				}),
				areaY(activity, {
					x: 'date',
					y: 'clicks',
					y1: 0,
					fill: `url(#${fillId})`,
					curve: monotone,
				}),
				ruleY([0], {
					stroke: 'currentColor',
					strokeOpacity: 0.25,
					strokeWidth: 1,
				}),
				lineY(activity, {
					x: 'date',
					y: 'clicks',
					stroke: COLOR,
					strokeWidth: 2,
					curve: monotone,
				}),
				...(interactive
					? [
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
						]
					: []),
			],
			scales: {
				x: {
					scale: () => scalePoint<string>().padding(0.1),
					axis: { line: false },
				},
				y: {
					scale: scaleLinear().domain([0, maximum]),
					nice: true,
					grid: { strokeDasharray: '4 4' },
					axis: { line: false },
				},
			},
			gradients: [
				{
					id: gradientId,
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1,
					stops: [
						{ offset: 0, color: COLOR, opacity: 0.12 },
						{ offset: 0.58, color: COLOR, opacity: 0.04 },
						{ offset: 1, color: COLOR, opacity: 0 },
					],
				},
			],
		});

		if (!interactive) {
			return defineChart(base, {
				svgAnimation: CHART_ANIMATION,
				focus: false,
				pointer: false,
				keyboard: false,
				focusRing: false,
			});
		}

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
	}, [activity, fillId, gradientId, interactive]);

	return (
		<Chart
			definition={definition}
			renderSvg={renderSvg}
			onRender={onRender}
			height={height}
			initialWidth={initialWidth}
			className='w-full'
			ariaLabel={
				ariaLabel ??
				(interactive
					? 'Clicks over time. Hover or use arrow keys to inspect a day.'
					: 'Example activity over time.')
			}
		/>
	);
}

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

	return (
		<Card.Root className='min-w-0'>
			<Card.Header className='flex flex-wrap items-start justify-between gap-3'>
				<div>
					<Card.Title>Activity</Card.Title>
					<Card.Description>Clicks over time</Card.Description>
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
					<p className='flex h-65 items-center justify-center text-center text-muted-foreground text-sm'>
						No clicks in this period.
					</p>
				) : (
					<ActivityChart activity={stats.activity} />
				)}
			</Card.Panel>
		</Card.Root>
	);
}
