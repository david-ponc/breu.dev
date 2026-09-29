import { Service } from 'diod';

import type {
	SearchRecentVisitsQuery,
	VisitLogEntry,
} from '#/contexts/analytics/visits/domain/link-stats';
import type { VisitStatsRepository } from '#/contexts/analytics/visits/domain/visit-stats-repository';

@Service()
export class LinkVisitLister {
	constructor(private readonly repository: VisitStatsRepository) {}

	execute(query: SearchRecentVisitsQuery): Promise<VisitLogEntry[]> {
		return this.repository.searchRecent(query);
	}
}
