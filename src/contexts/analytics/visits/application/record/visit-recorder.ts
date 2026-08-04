import { Service } from 'diod';

import type { UserAgentParser } from '#/contexts/analytics/visits/domain/user-agent-parser';
import {
	createVisit,
	type RecordVisitCommand,
} from '#/contexts/analytics/visits/domain/visit';
import type { VisitRepository } from '#/contexts/analytics/visits/domain/visit-repository';
import { Identifier } from '#/core/lib/identifier';

@Service()
export class VisitRecorder {
	constructor(
		private readonly repository: VisitRepository,
		private readonly userAgentParser: UserAgentParser,
	) {}

	async execute(command: RecordVisitCommand): Promise<void> {
		const alreadyRecorded = await this.repository.existsByEventId(command.eventId);

		if (alreadyRecorded) {
			return;
		}

		const parsed = this.userAgentParser.parse(command.userAgentRaw);

		const visit = createVisit({
			id: Identifier.generate(),
			eventId: command.eventId,
			linkId: command.linkId,
			userId: command.userId,
			ip: command.ip,
			country: command.country ?? null,
			referer: command.referer,
			userAgentRaw: command.userAgentRaw,
			userAgent: parsed?.userAgent ?? null,
			isBot: parsed?.isBot ?? false,
			visitedAt: command.visitedAt,
		});

		await this.repository.save(visit);
	}
}
