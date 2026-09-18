import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';

import { ActivitySparkline } from './activity-sparkline';

export function ActivityColumn({ activity }: Pick<LinkSummary, 'activity'>) {
	return <ActivitySparkline activity={activity} />;
}
