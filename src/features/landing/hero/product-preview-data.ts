import type { LinkActivity } from '#/contexts/analytics/visits/domain/link-stats';
import type { Meta } from '#/contexts/brevis/links/domain/link';

const DAILY_CLICKS = [18, 26, 34, 22, 49, 61, 55, 84, 72, 96, 88, 120, 105, 170];

export const productPreviewData = {
	slug: 'launch-notes',
	url: 'https://example.com/launch',
	lifetimeClicks: 2847,
	bots: 24,
	lastClickLabel: '2 min ago',
	activity: DAILY_CLICKS.map((clicks, index) => ({
		date: `2026-09-${String(index + 1).padStart(2, '0')}`,
		clicks,
	})) satisfies LinkActivity[],
} as const;

export const previewPeriodClicks = productPreviewData.activity.reduce(
	(total, point) => total + point.clicks,
	0,
);

export const previewMeta: Meta = {
	author: 'Breu Journal',
	favicon: null,
	title: 'Launch notes',
	description:
		'Updates, ideas, and what comes next. A little closer to what we are building.',
	openGraph: {
		title: 'Launch notes',
		description:
			'Updates, ideas, and what comes next. A little closer to what we are building.',
		image: null,
		author: 'Breu Journal',
		tags: ['Design', 'Inspiration'],
		siteName: 'Breu',
		type: 'article',
	},
};
