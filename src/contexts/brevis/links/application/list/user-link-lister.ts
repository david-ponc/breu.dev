import { Service } from 'diod';

import type { LinkSummary } from '../../domain/link-summary';
import type { LinkSummaryRepository } from '../../domain/link-summary-repository';

const ACTIVITY_DAYS = 14;
const DAY_MS = 86_400_000;

@Service()
export class UserLinkLister {
	constructor(private readonly repository: LinkSummaryRepository) {}

	async execute(userId: string, now = new Date()): Promise<LinkSummary[]> {
		const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
		const dates = Array.from({ length: ACTIVITY_DAYS }, (_, index) =>
			new Date(today - (ACTIVITY_DAYS - 1 - index) * DAY_MS).toISOString().slice(0, 10),
		);
		const links = await this.repository.searchByUserId(
			userId,
			new Date(today - (ACTIVITY_DAYS - 1) * DAY_MS).toISOString(),
			now.toISOString(),
		);

		return links.map((link) => {
			const counts = new Map(link.activity.map((point) => [point.date, point.clicks]));
			return {
				...link,
				activity: dates.map((date) => ({ date, clicks: counts.get(date) ?? 0 })),
			};
		});
	}
}
