import type { LinkSummary } from './link-summary';

export abstract class LinkSummaryRepository {
	abstract searchByUserId(
		userId: string,
		since: string,
		until: string,
	): Promise<LinkSummary[]>;
}
