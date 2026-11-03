import type { DeviceType } from '#/contexts/analytics/visits/domain/visit';
import type { IconName } from '#/core/lib/icon-registry';

export interface AgentMeta {
	icon: IconName;
	label: string;
}

export interface AgentBadge {
	label: string;
	className?: string;
}

const DEVICE_META = {
	desktop: { icon: 'device-desktop', label: 'Desktop' },
	mobile: { icon: 'device-mobile', label: 'Mobile' },
	tablet: { icon: 'device-tablet', label: 'Tablet' },
	bot: { icon: 'device-unknown', label: 'Unknown' },
	unknown: { icon: 'device-unknown', label: 'Unknown' },
} as const satisfies Record<DeviceType, AgentMeta>;

export function deviceAgent(type: DeviceType): AgentMeta {
	return DEVICE_META[type];
}

const OS_MATCHERS: ReadonlyArray<{ pattern: RegExp; icon: IconName }> = [
	{ pattern: /windows/i, icon: 'os-windows' },
	{ pattern: /mac|ios|ipad|iphone|apple|darwin/i, icon: 'os-apple' },
	{ pattern: /android/i, icon: 'os-android' },
	{
		pattern:
			/linux|ubuntu|debian|fedora|arch|centos|red hat|suse|gentoo|alpine|manjaro|mint/i,
		icon: 'os-linux',
	},
];

export function osAgent(os: string | null): AgentMeta {
	if (!os) {
		return { icon: 'os-unknown', label: 'Unknown' };
	}

	const match = OS_MATCHERS.find(({ pattern }) => pattern.test(os));

	return { icon: match?.icon ?? 'os-unknown', label: os };
}

const BROWSER_TINTS: ReadonlyArray<{ pattern: RegExp; className: string }> = [
	{
		pattern: /firefox/i,
		className: 'agent-tint agent-tint-orange',
	},
	{
		pattern: /safari/i,
		className: 'agent-tint agent-tint-blue',
	},
	{
		pattern: /edge/i,
		className: 'agent-tint agent-tint-teal',
	},
	{
		pattern: /opera|vivaldi|yandex/i,
		className: 'agent-tint agent-tint-red',
	},
	{
		pattern: /brave/i,
		className: 'agent-tint agent-tint-amber',
	},
	{
		pattern: /samsung/i,
		className: 'agent-tint agent-tint-indigo',
	},
	{
		pattern: /chrome|chromium/i,
		className: 'agent-tint agent-tint-sky',
	},
];

export function browserAgent(browser: string | null): AgentBadge {
	if (!browser) {
		return { label: 'Unknown' };
	}

	const match = BROWSER_TINTS.find(({ pattern }) => pattern.test(browser));

	return { label: browser, className: match?.className };
}

const REFERRER_TINTS: ReadonlyArray<{
	pattern: RegExp;
	label: string;
	className: string;
}> = [
	{
		pattern: /facebook|fb\./i,
		label: 'Facebook',
		className: 'agent-tint agent-tint-blue',
	},
	{
		pattern: /linkedin|lnkd/i,
		label: 'LinkedIn',
		className: 'agent-tint agent-tint-sky',
	},
	{
		pattern: /reddit/i,
		label: 'Reddit',
		className: 'agent-tint agent-tint-orange',
	},
	{
		pattern: /producthunt/i,
		label: 'Product Hunt',
		className: 'agent-tint agent-tint-orange',
	},
	{
		pattern: /ycombinator|hn\./i,
		label: 'Hacker News',
		className: 'agent-tint agent-tint-orange',
	},
	{
		pattern: /youtube|youtu\.be/i,
		label: 'YouTube',
		className: 'agent-tint agent-tint-red',
	},
	{
		pattern: /instagram/i,
		label: 'Instagram',
		className: 'agent-tint agent-tint-fuchsia',
	},
	{
		pattern: /whatsapp/i,
		label: 'WhatsApp',
		className: 'agent-tint agent-tint-emerald',
	},
	{
		pattern: /google/i,
		label: 'Google',
		className: 'agent-tint agent-tint-blue',
	},
	{
		pattern: /bing/i,
		label: 'Bing',
		className: 'agent-tint agent-tint-blue',
	},
	{
		pattern: /duckduckgo/i,
		label: 'DuckDuckGo',
		className: 'agent-tint agent-tint-blue',
	},
	{
		pattern: /telegram|t\.me/i,
		label: 'Telegram',
		className: 'agent-tint agent-tint-cyan',
	},
	{
		pattern: /x\.com|twitter|t\.co/i,
		label: 'X',
		className: 'agent-tint agent-tint-neutral',
	},
	{
		pattern: /github/i,
		label: 'GitHub',
		className: 'agent-tint agent-tint-neutral',
	},
	{
		pattern: /gitlab/i,
		label: 'GitLab',
		className: 'agent-tint agent-tint-neutral',
	},
];

export function referrerLabel(referrer: string): string {
	if (referrer === 'Direct') {
		return 'Direct';
	}

	const match = REFERRER_TINTS.find(({ pattern }) => pattern.test(referrer));

	return match?.label ?? referrer.replace(/^www\./i, '');
}

export function referrerAgent(referrer: string): AgentBadge {
	if (referrer === 'Direct') {
		return { label: 'Direct' };
	}

	const match = REFERRER_TINTS.find(({ pattern }) => pattern.test(referrer));

	return {
		label: referrerLabel(referrer),
		className: match?.className,
	};
}

export function originAgent(isBot: boolean): AgentMeta {
	return isBot ? { icon: 'robot', label: 'Bot' } : { icon: 'account', label: 'Human' };
}
