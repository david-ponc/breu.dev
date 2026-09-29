import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';

import { ActivitySparkline } from './activity-sparkline';

export function ActivityColumn({
	activity,
	totalClicks,
}: Pick<LinkSummary, 'activity' | 'totalClicks'>) {
	return (
		<div className='flex items-end gap-4'>
			<ActivitySparkline activity={activity} />
			<span className='shrink-0'>{totalClicks}</span>
		</div>
	);
}
