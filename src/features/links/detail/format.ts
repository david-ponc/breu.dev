import type { DeviceType } from '#/contexts/analytics/visits/domain/visit';

const numberFormatter = new Intl.NumberFormat('en-US');
const percentFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC',
});
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
	timeZone: 'UTC',
});
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const DEVICE_LABELS = {
	desktop: 'Desktop',
	mobile: 'Mobile',
	tablet: 'Tablet',
	bot: 'Bot',
	unknown: 'Unknown',
} as const satisfies Record<DeviceType, string>;

export function formatCount(value: number) {
	return numberFormatter.format(value);
}

export function formatShare(count: number, total: number) {
	return percentFormatter.format(total === 0 ? 0 : count / total);
}

export function formatDate(iso: string) {
	return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string) {
	return dateTimeFormatter.format(new Date(iso));
}

export function formatRelativeTime(iso: string, now = new Date()) {
	const diffMs = new Date(iso).getTime() - now.getTime();
	const abs = Math.abs(diffMs);
	const divisions = [
		{ amount: 60_000, unit: 'second', ms: 1000 },
		{ amount: 3_600_000, unit: 'minute', ms: 60_000 },
		{ amount: 86_400_000, unit: 'hour', ms: 3_600_000 },
		{ amount: 2_592_000_000, unit: 'day', ms: 86_400_000 },
		{ amount: 30_369_000_000, unit: 'month', ms: 2_592_000_000 },
	] as const;

	for (const division of divisions) {
		if (abs < division.amount) {
			return relativeFormatter.format(Math.round(diffMs / division.ms), division.unit);
		}
	}

	return formatDate(iso);
}

export function formatDevice(value: string) {
	return DEVICE_LABELS[value as DeviceType] ?? value;
}

export function formatCountry(code: string) {
	try {
		return regionNames.of(code) ?? code;
	} catch {
		return code;
	}
}

export function formatReferrerHost(referer: string | null) {
	if (!referer) return 'Direct';
	try {
		return new URL(referer).host;
	} catch {
		return referer;
	}
}
