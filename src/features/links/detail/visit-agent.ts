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
		className:
			'bg-orange-500/12 text-orange-700 dark:bg-orange-400/16 dark:text-orange-300',
	},
	{
		pattern: /safari/i,
		className: 'bg-blue-500/12 text-blue-700 dark:bg-blue-400/16 dark:text-blue-300',
	},
	{
		pattern: /edge/i,
		className: 'bg-teal-500/12 text-teal-700 dark:bg-teal-400/16 dark:text-teal-300',
	},
	{
		pattern: /opera|vivaldi|yandex/i,
		className: 'bg-red-500/12 text-red-700 dark:bg-red-400/16 dark:text-red-300',
	},
	{
		pattern: /brave/i,
		className: 'bg-amber-500/12 text-amber-700 dark:bg-amber-400/16 dark:text-amber-300',
	},
	{
		pattern: /samsung/i,
		className:
			'bg-indigo-500/12 text-indigo-700 dark:bg-indigo-400/16 dark:text-indigo-300',
	},
	{
		pattern: /chrome|chromium/i,
		className: 'bg-sky-500/12 text-sky-700 dark:bg-sky-400/16 dark:text-sky-300',
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
		className: 'bg-blue-500/12 text-blue-700 dark:bg-blue-400/16 dark:text-blue-300',
	},
	{
		pattern: /linkedin|lnkd/i,
		label: 'LinkedIn',
		className: 'bg-sky-500/12 text-sky-700 dark:bg-sky-400/16 dark:text-sky-300',
	},
	{
		pattern: /reddit/i,
		label: 'Reddit',
		className:
			'bg-orange-500/12 text-orange-700 dark:bg-orange-400/16 dark:text-orange-300',
	},
	{
		pattern: /producthunt/i,
		label: 'Product Hunt',
		className:
			'bg-orange-500/12 text-orange-700 dark:bg-orange-400/16 dark:text-orange-300',
	},
	{
		pattern: /ycombinator|hn\./i,
		label: 'Hacker News',
		className:
			'bg-orange-500/12 text-orange-700 dark:bg-orange-400/16 dark:text-orange-300',
	},
	{
		pattern: /youtube|youtu\.be/i,
		label: 'YouTube',
		className: 'bg-red-500/12 text-red-700 dark:bg-red-400/16 dark:text-red-300',
	},
	{
		pattern: /instagram/i,
		label: 'Instagram',
		className:
			'bg-fuchsia-500/12 text-fuchsia-700 dark:bg-fuchsia-400/16 dark:text-fuchsia-300',
	},
	{
		pattern: /whatsapp/i,
		label: 'WhatsApp',
		className:
			'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/16 dark:text-emerald-300',
	},
	{
		pattern: /google/i,
		label: 'Google',
		className: 'bg-blue-500/12 text-blue-700 dark:bg-blue-400/16 dark:text-blue-300',
	},
	{
		pattern: /bing/i,
		label: 'Bing',
		className: 'bg-blue-500/12 text-blue-700 dark:bg-blue-400/16 dark:text-blue-300',
	},
	{
		pattern: /duckduckgo/i,
		label: 'DuckDuckGo',
		className: 'bg-blue-500/12 text-blue-700 dark:bg-blue-400/16 dark:text-blue-300',
	},
	{
		pattern: /telegram|t\.me/i,
		label: 'Telegram',
		className: 'bg-cyan-500/12 text-cyan-700 dark:bg-cyan-400/16 dark:text-cyan-300',
	},
	{
		pattern: /x\.com|twitter|t\.co/i,
		label: 'X',
		className: 'bg-zinc-900/10 text-zinc-900 dark:bg-zinc-100/14 dark:text-zinc-100',
	},
	{
		pattern: /github/i,
		label: 'GitHub',
		className: 'bg-zinc-900/10 text-zinc-900 dark:bg-zinc-100/14 dark:text-zinc-100',
	},
	{
		pattern: /gitlab/i,
		label: 'GitLab',
		className: 'bg-zinc-900/10 text-zinc-900 dark:bg-zinc-100/14 dark:text-zinc-100',
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
