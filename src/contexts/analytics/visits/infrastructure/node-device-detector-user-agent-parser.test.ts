import { describe, expect, it } from 'vitest';

import { DEVICE_TYPE } from '../domain/visit';
import { NodeDeviceDetectorUserAgentParser } from './node-device-detector-user-agent-parser';

const DESKTOP_CHROME =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IPHONE_SAFARI =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPAD_SAFARI =
	'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const GOOGLEBOT =
	'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const ANDROID_CHROME =
	'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

describe('NodeDeviceDetectorUserAgentParser', () => {
	const parser = new NodeDeviceDetectorUserAgentParser();

	it('returns null when raw is nullish', () => {
		expect(parser.parse(null)).toBeNull();
		expect(parser.parse('')).toBeNull();
	});

	it('parses desktop chrome', () => {
		expect(parser.parse(DESKTOP_CHROME)).toEqual({
			userAgent: {
				browser: 'Chrome',
				os: 'Mac',
				deviceType: DEVICE_TYPE.Desktop,
			},
			isBot: false,
		});
	});

	it('parses mobile safari on iphone', () => {
		expect(parser.parse(IPHONE_SAFARI)).toEqual({
			userAgent: {
				browser: 'Mobile Safari',
				os: 'iOS',
				deviceType: DEVICE_TYPE.Mobile,
			},
			isBot: false,
		});
	});

	it('parses tablet safari on ipad', () => {
		expect(parser.parse(IPAD_SAFARI)).toEqual({
			userAgent: {
				browser: 'Mobile Safari',
				os: 'iPadOS',
				deviceType: DEVICE_TYPE.Tablet,
			},
			isBot: false,
		});
	});

	it('parses android chrome as mobile', () => {
		expect(parser.parse(ANDROID_CHROME)).toEqual({
			userAgent: {
				browser: 'Chrome Mobile',
				os: 'Android',
				deviceType: DEVICE_TYPE.Mobile,
			},
			isBot: false,
		});
	});

	it('marks bots', () => {
		expect(parser.parse(GOOGLEBOT)).toEqual({
			userAgent: {
				browser: null,
				os: null,
				deviceType: DEVICE_TYPE.Bot,
			},
			isBot: true,
		});
	});
});
