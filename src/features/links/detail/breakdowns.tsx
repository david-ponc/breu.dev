import { useSuspenseQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import type { NamedCount } from '#/contexts/analytics/visits/domain/link-stats';
import { Card } from '#/core/ui/card';

import { BreakdownChart, CountryFlag } from './breakdown-chart';
import { formatCountry, formatDevice } from './format';
import { linkStatsQueryOptions } from './query';
import type { ActivityRange } from './range';
import { referrerLabel } from './visit-agent';

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
		<div data-stagger className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6'>
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
			<BreakdownCard
				title='Referrers'
				items={stats.referrers}
				formatKey={referrerLabel}
			/>
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
		<Card.Root
			size='sm'
			className='min-w-0 md:last:col-span-2 xl:col-span-2 xl:nth-4:col-span-3 xl:last:col-span-3'
		>
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
