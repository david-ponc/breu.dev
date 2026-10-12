import { describe, expect, it } from 'vitest';

import {
	browserAgent,
	deviceAgent,
	originAgent,
	osAgent,
	referrerAgent,
	referrerLabel,
} from './visit-agent';

describe('deviceAgent', () => {
	it('maps known device types to their icons', () => {
		expect(deviceAgent('desktop')).toEqual({ icon: 'device-desktop', label: 'Desktop' });
		expect(deviceAgent('mobile')).toEqual({ icon: 'device-mobile', label: 'Mobile' });
		expect(deviceAgent('tablet')).toEqual({ icon: 'device-tablet', label: 'Tablet' });
	});

	it('falls back to the unknown icon for bots and unknown devices', () => {
		expect(deviceAgent('bot')).toEqual({ icon: 'device-unknown', label: 'Unknown' });
		expect(deviceAgent('unknown')).toEqual({ icon: 'device-unknown', label: 'Unknown' });
	});
});

describe('osAgent', () => {
	it('matches the operating system brand', () => {
		expect(osAgent('Windows')).toEqual({ icon: 'os-windows', label: 'Windows' });
		expect(osAgent('Mac')).toEqual({ icon: 'os-apple', label: 'Mac' });
		expect(osAgent('iOS')).toEqual({ icon: 'os-apple', label: 'iOS' });
		expect(osAgent('iPadOS')).toEqual({ icon: 'os-apple', label: 'iPadOS' });
		expect(osAgent('Android')).toEqual({ icon: 'os-android', label: 'Android' });
		expect(osAgent('Ubuntu')).toEqual({ icon: 'os-linux', label: 'Ubuntu' });
		expect(osAgent('GNU/Linux')).toEqual({ icon: 'os-linux', label: 'GNU/Linux' });
	});

	it('falls back to unknown for nullish or unrecognized systems', () => {
		expect(osAgent(null)).toEqual({ icon: 'os-unknown', label: 'Unknown' });
		expect(osAgent('Haiku')).toEqual({ icon: 'os-unknown', label: 'Haiku' });
	});
});

describe('browserAgent', () => {
	it('labels the browser and tints known brands', () => {
		expect(browserAgent('Chrome')).toMatchObject({ label: 'Chrome' });
		expect(browserAgent('Chrome')?.className).toContain('text-sky-700');
		expect(browserAgent('Firefox')?.className).toContain('text-orange-700');
		expect(browserAgent('Mobile Safari')?.className).toContain('text-blue-700');
	});

	it('falls back to a neutral badge', () => {
		expect(browserAgent(null)).toEqual({ label: 'Unknown' });
		expect(browserAgent('curl')).toEqual({ label: 'curl', className: undefined });
	});
});

describe('referrerAgent', () => {
	it('tints known referrers and renders their brand label', () => {
		expect(referrerAgent('Direct')).toEqual({ label: 'Direct' });
		expect(referrerAgent('www.google.com')).toMatchObject({ label: 'Google' });
		expect(referrerAgent('www.google.com')?.className).toContain('text-blue-700');
		expect(referrerAgent('news.ycombinator.com')).toMatchObject({
			label: 'Hacker News',
		});
		expect(referrerAgent('news.ycombinator.com')?.className).toContain('text-orange-700');
		expect(referrerAgent('www.facebook.com')).toMatchObject({ label: 'Facebook' });
		expect(referrerAgent('t.me')).toMatchObject({ label: 'Telegram' });
		expect(referrerAgent('x.com')).toMatchObject({ label: 'X' });
		expect(referrerAgent('github.com')).toMatchObject({ label: 'GitHub' });
	});

	it('strips the www prefix for unknown referrers', () => {
		expect(referrerAgent('example.com')).toEqual({
			label: 'example.com',
			className: undefined,
		});
		expect(referrerAgent('www.example.com')).toEqual({
			label: 'example.com',
			className: undefined,
		});
	});
});

describe('referrerLabel', () => {
	it('maps known referrers to their brand name', () => {
		expect(referrerLabel('Direct')).toBe('Direct');
		expect(referrerLabel('google.com')).toBe('Google');
		expect(referrerLabel('www.facebook.com')).toBe('Facebook');
		expect(referrerLabel('news.ycombinator.com')).toBe('Hacker News');
	});

	it('falls back to the host without the www prefix', () => {
		expect(referrerLabel('example.com')).toBe('example.com');
		expect(referrerLabel('www.example.com')).toBe('example.com');
	});
});

describe('originAgent', () => {
	it('separates bots from humans', () => {
		expect(originAgent(true)).toEqual({ icon: 'robot', label: 'Bot' });
		expect(originAgent(false)).toEqual({ icon: 'account', label: 'Human' });
	});
});
