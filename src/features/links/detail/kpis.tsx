import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { cn } from '#/core/lib/cn';
import { Card } from '#/core/ui/card';

import { formatCount, formatRelativeTime } from './format';
import { linkStatsQueryOptions } from './query';
import type { ActivityRange } from './range';

interface LinkDetailKpisProps {
	linkId: string;
	userId: string;
	range: ActivityRange;
}

export function LinkDetailKpis({ linkId, userId, range }: LinkDetailKpisProps) {
	const { data: stats } = useSuspenseQuery(linkStatsQueryOptions(userId, linkId, range));

	return (
		<div data-stagger='blur' className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
			<KpiCard label='Clicks' value={formatCount(stats.lifetimeClicks)} />
			<KpiCard label='Period' value={formatCount(stats.periodClicks)} />
			<KpiCard label='Bots' value={formatCount(stats.bots)} />
			<KpiCard
				label='Last click'
				value={stats.lastVisitedAt ? formatRelativeTime(stats.lastVisitedAt) : '—'}
			/>
		</div>
	);
}

function KpiCard({ label, value }: { label: string; value: string }) {
	return (
		<Card.Root size='sm'>
			<Card.Header>
				<Card.Description>{label}</Card.Description>
			</Card.Header>
			<Card.Panel>
				<p className='font-semibold text-2xl tracking-tight'>
					<AnimatedValue value={value} />
				</p>
			</Card.Panel>
		</Card.Root>
	);
}

function AnimatedValue({ value }: { value: string }) {
	const [display, setDisplay] = useState(value);
	const [outgoing, setOutgoing] = useState<string | null>(null);
	const mounted = useRef(false);

	useEffect(() => {
		mounted.current = true;
	}, []);

	if (value !== display) {
		setOutgoing(display);
		setDisplay(value);
	}

	return (
		<span className='inline-grid'>
			{outgoing !== null && (
				<span
					key={`out-${outgoing}`}
					aria-hidden
					className='kpi-value-out col-start-1 row-start-1'
				>
					{outgoing}
				</span>
			)}
			<span
				key={`in-${display}`}
				className={cn('col-start-1 row-start-1', mounted.current && 'kpi-value-in')}
			>
				{display}
			</span>
		</span>
	);
}
