import { Service } from 'diod';

import type {
	LinkStats,
	SearchLinkStatsQuery,
	SearchRecentVisitsQuery,
	VisitLogEntry,
} from './link-stats';

@Service()
export abstract class VisitStatsRepository {
	abstract searchStats(query: SearchLinkStatsQuery): Promise<LinkStats>;
	abstract searchRecent(query: SearchRecentVisitsQuery): Promise<VisitLogEntry[]>;
}
