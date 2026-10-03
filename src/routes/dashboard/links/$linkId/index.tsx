import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { QueryBoundary } from '#/core/ui/query-boundary';
import { LinkDetailActivityChart } from '#/features/links/detail/activity-chart';
import { LinkDetailBreakdowns } from '#/features/links/detail/breakdowns';
import { LinkDetailKpis } from '#/features/links/detail/kpis';
import { LinkDetailPreview } from '#/features/links/detail/preview';
import { linkStatsQueryOptions } from '#/features/links/detail/query';
import type { ActivityRange } from '#/features/links/detail/range';
import {
	BreakdownsSkeleton,
	ChartSkeleton,
	KpisSkeleton,
	PreviewSkeleton,
} from '#/features/links/detail/skeletons';

export const Route = createFileRoute('/dashboard/links/$linkId/')({
	loader: ({ context, params }) => {
		void context.queryClient.prefetchQuery(
			linkStatsQueryOptions(context.session.user.id, params.linkId, '14d'),
		);
	},
	component: Page,
});

function Page() {
	const { linkId } = Route.useParams();
	const { session } = Route.useRouteContext();
	const userId = session.user.id;
	const [range, setRange] = useState<ActivityRange>('14d');

	return (
		<div data-stagger className='flex min-w-0 flex-col gap-6 pb-6'>
			<QueryBoundary fallback={<KpisSkeleton />}>
				<LinkDetailKpis linkId={linkId} userId={userId} range={range} />
			</QueryBoundary>
			<div className='grid min-w-0 grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
				<div className='min-w-0'>
					<QueryBoundary fallback={<ChartSkeleton />}>
						<LinkDetailActivityChart
							linkId={linkId}
							userId={userId}
							range={range}
							onRangeChange={setRange}
						/>
					</QueryBoundary>
				</div>
				<QueryBoundary fallback={<PreviewSkeleton />}>
					<LinkDetailPreview linkId={linkId} userId={userId} />
				</QueryBoundary>
			</div>
			<QueryBoundary fallback={<BreakdownsSkeleton />}>
				<LinkDetailBreakdowns linkId={linkId} userId={userId} range={range} />
			</QueryBoundary>
		</div>
	);
}
