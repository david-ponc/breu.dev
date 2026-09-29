import { Service } from 'diod';

import { fillDailyActivity } from '#/contexts/analytics/visits/domain/fill-daily-activity';
import {
	type LinkStats,
	LinkStatsSchema,
	type SearchLinkStatsQuery,
} from '#/contexts/analytics/visits/domain/link-stats';
import type { VisitStatsRepository } from '#/contexts/analytics/visits/domain/visit-stats-repository';

@Service()
export class LinkStatsFinder {
	constructor(private readonly repository: VisitStatsRepository) {}

	async execute(query: SearchLinkStatsQuery): Promise<LinkStats> {
		const stats = await this.repository.searchStats(query);

		return LinkStatsSchema.parse({
			...stats,
			activity: fillDailyActivity(stats.activity, query.since, query.until),
		});
	}
}
