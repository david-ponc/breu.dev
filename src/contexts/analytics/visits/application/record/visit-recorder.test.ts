import { beforeEach, describe, expect, it } from 'vitest';

import type {
	UserAgentParseResult,
	UserAgentParser,
} from '#/contexts/analytics/visits/domain/user-agent-parser';
import {
	DEVICE_TYPE,
	type RecordVisitCommand,
	type Visit,
} from '#/contexts/analytics/visits/domain/visit';
import { InMemoryVisitRepository } from '#/contexts/analytics/visits/infrastructure/in-memory-visit-repository';
import { Identifier } from '#/core/lib/identifier';
import type { Maybe } from '#/core/types';

import { VisitRecorder } from './visit-recorder';

class FakeUserAgentParser implements UserAgentParser {
	constructor(private readonly result: Maybe<UserAgentParseResult> = null) {}

	parse(_raw: Maybe<string>): Maybe<UserAgentParseResult> {
		return this.result;
	}
}

function aRecordCommand(overrides?: Partial<RecordVisitCommand>): RecordVisitCommand {
	return {
		eventId: Identifier.generate(),
		linkId: Identifier.generate(),
		userId: Identifier.generate(),
		ip: '203.0.113.10',
		referer: 'https://t.co/abc',
		userAgentRaw: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
		visitedAt: new Date().toISOString(),
		...overrides,
	};
}

describe('recording a visit', () => {
	let repository: InMemoryVisitRepository;
	let recorder: VisitRecorder;
	let parser: FakeUserAgentParser;

	beforeEach(() => {
		repository = new InMemoryVisitRepository();
		parser = new FakeUserAgentParser({
			userAgent: {
				browser: 'Chrome',
				os: 'macOS',
				deviceType: DEVICE_TYPE.Desktop,
			},
			isBot: false,
		});
		recorder = new VisitRecorder(repository, parser);
	});

	it('persists an enriched visit from the command', async () => {
		const command = aRecordCommand({ country: 'ES' });

		await recorder.execute(command);

		const [visit] = await repository.findAll();
		expect(visit).toMatchObject<Partial<Visit>>({
			eventId: command.eventId,
			linkId: command.linkId,
			userId: command.userId,
			ip: command.ip,
			country: 'ES',
			referer: command.referer,
			userAgentRaw: command.userAgentRaw,
			userAgent: {
				browser: 'Chrome',
				os: 'macOS',
				deviceType: DEVICE_TYPE.Desktop,
			},
			isBot: false,
			visitedAt: command.visitedAt,
		});
		expect(visit?.id).toBeDefined();
	});

	it('defaults country to null when omitted', async () => {
		await recorder.execute(aRecordCommand());

		const [visit] = await repository.findAll();
		expect(visit?.country).toBeNull();
	});

	it('stores null user agent fields when the parser returns nothing', async () => {
		recorder = new VisitRecorder(repository, new FakeUserAgentParser(null));

		await recorder.execute(aRecordCommand());

		const [visit] = await repository.findAll();
		expect(visit?.userAgent).toBeNull();
		expect(visit?.isBot).toBe(false);
	});

	it('marks bot traffic from the parser result', async () => {
		recorder = new VisitRecorder(
			repository,
			new FakeUserAgentParser({
				userAgent: {
					browser: null,
					os: null,
					deviceType: DEVICE_TYPE.Bot,
				},
				isBot: true,
			}),
		);

		await recorder.execute(aRecordCommand());

		const [visit] = await repository.findAll();
		expect(visit?.isBot).toBe(true);
		expect(visit?.userAgent?.deviceType).toBe(DEVICE_TYPE.Bot);
	});

	it('is idempotent for the same event id', async () => {
		const command = aRecordCommand();

		await recorder.execute(command);
		await recorder.execute(command);

		const visits = await repository.findAll();
		expect(visits).toHaveLength(1);
	});
});
