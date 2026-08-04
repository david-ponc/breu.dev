import { describe, expect, it } from 'vitest';

import { Identifier } from '#/core/lib/identifier';

import {
	type CreateVisitCommand,
	createVisit,
	DEVICE_TYPE,
	type Visit,
	VisitSchema,
} from './visit';

function aVisitCommand(overrides?: Partial<CreateVisitCommand>): CreateVisitCommand {
	return {
		id: Identifier.generate(),
		eventId: Identifier.generate(),
		linkId: Identifier.generate(),
		userId: Identifier.generate(),
		ip: '203.0.113.10',
		country: 'ES',
		referer: 'https://t.co/abc',
		userAgentRaw: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
		userAgent: {
			browser: 'Chrome',
			os: 'macOS',
			deviceType: DEVICE_TYPE.Desktop,
		},
		isBot: false,
		visitedAt: new Date().toISOString(),
		...overrides,
	};
}

function aVisit(overrides?: Partial<Visit>): Visit {
	return VisitSchema.parse(aVisitCommand(overrides));
}

describe('creating a visit', () => {
	it('records the full visit state', () => {
		const command = aVisitCommand();
		const visit = createVisit(command);

		expect(visit).toEqual(command);
	});

	it('accepts null enrichment fields', () => {
		const visit = createVisit(
			aVisitCommand({
				ip: null,
				country: null,
				referer: null,
				userAgentRaw: null,
				userAgent: null,
			}),
		);

		expect(visit.ip).toBeNull();
		expect(visit.country).toBeNull();
		expect(visit.referer).toBeNull();
		expect(visit.userAgentRaw).toBeNull();
		expect(visit.userAgent).toBeNull();
	});

	it('marks bot traffic explicitly', () => {
		const visit = createVisit(
			aVisitCommand({
				isBot: true,
				userAgent: {
					browser: null,
					os: null,
					deviceType: DEVICE_TYPE.Bot,
				},
			}),
		);

		expect(visit.isBot).toBe(true);
		expect(visit.userAgent?.deviceType).toBe(DEVICE_TYPE.Bot);
	});

	it('rejects an identifier that is not a valid UUID v7', () => {
		expect(() => createVisit(aVisitCommand({ id: 'not-a-uuid' }))).toThrow();
	});

	it('rejects a country that is not ISO 3166-1 alpha-2', () => {
		expect(() => createVisit(aVisitCommand({ country: 'es' }))).toThrow();
		expect(() => createVisit(aVisitCommand({ country: 'ESP' }))).toThrow();
		expect(() => createVisit(aVisitCommand({ country: 'Spain' }))).toThrow();
	});

	it('rejects an invalid visitedAt timestamp', () => {
		expect(() => createVisit(aVisitCommand({ visitedAt: 'not-a-date' }))).toThrow();
	});

	it('rejects an unknown device type', () => {
		expect(() =>
			createVisit(
				aVisitCommand({
					userAgent: {
						browser: 'Chrome',
						os: 'macOS',
						// @ts-expect-error intentional invalid value
						deviceType: 'smartwatch',
					},
				}),
			),
		).toThrow();
	});
});

describe('visit schema', () => {
	it('parses a valid visit', () => {
		expect(() => aVisit()).not.toThrow();
	});
});
