import ogs from 'open-graph-scraper';
import { describe, expect, it } from 'vitest';

import { mapOgObjectToMeta } from './open-graph-scraper-meta-collector';

const PAGE_URL = 'https://example.com/articles/hello';

describe('mapOgObjectToMeta', () => {
	it('maps open graph tags into the domain Meta shape', async () => {
		const { result } = await ogs({
			html: `
				<html>
					<head>
						<title>Fallback Title</title>
						<meta property="og:title" content="OG Title" />
						<meta property="og:description" content="OG Description" />
						<meta property="og:image" content="/images/cover.png" />
						<meta name="author" content="Ada Lovelace" />
						<link rel="icon" href="/favicon.ico" />
					</head>
				</html>
			`,
		});

		const meta = mapOgObjectToMeta(result, PAGE_URL);

		expect(meta).toEqual({
			author: 'Ada Lovelace',
			favicon: 'https://example.com/favicon.ico',
			title: 'OG Title',
			description: 'OG Description',
			openGraph: {
				title: 'OG Title',
				description: 'OG Description',
				image: 'https://example.com/images/cover.png',
			},
		});
	});

	it('falls back to twitter and dc tags when open graph is missing', async () => {
		const { result } = await ogs({
			html: `
				<html>
					<head>
						<meta name="twitter:title" content="Twitter Title" />
						<meta name="twitter:description" content="Twitter Description" />
						<meta name="dc.title" content="DC Title" />
						<meta name="dc.creator" content="Grace Hopper" />
					</head>
				</html>
			`,
		});

		const meta = mapOgObjectToMeta(result, PAGE_URL);

		expect(meta.title).toBe('Twitter Title');
		expect(meta.description).toBe('Twitter Description');
		expect(meta.author).toBe('Grace Hopper');
		expect(meta.openGraph?.title).toBe('Twitter Title');
		expect(meta.openGraph?.description).toBe('Twitter Description');
		expect(meta.favicon).toBeNull();
		expect(meta.openGraph?.image).toBeNull();
	});

	it('returns nulls for missing optional fields', async () => {
		const { result } = await ogs({
			html: '<html><head></head><body></body></html>',
		});

		const meta = mapOgObjectToMeta(result, PAGE_URL);

		expect(meta).toEqual({
			author: null,
			favicon: null,
			title: null,
			description: null,
			openGraph: {
				title: null,
				description: null,
				image: null,
			},
		});
	});
});
