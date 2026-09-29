import { useSuspenseQuery } from '@tanstack/react-query';

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
		<div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
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
				<p className='font-semibold text-2xl tracking-tight'>{value}</p>
			</Card.Panel>
		</Card.Root>
	);
}
