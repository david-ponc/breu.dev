import ogs from 'open-graph-scraper';
import { describe, expect, it } from 'vitest';

import { OpenGraphSchema } from '../domain/link';
import {
	ARTICLE_META_TAGS,
	mapOgObjectToMeta,
} from './open-graph-scraper-meta-collector';

const PAGE_URL = 'https://example.com/articles/hello';
const EMPTY_ARTICLE_FIELDS = {
	author: null,
	tags: [],
	siteName: null,
	type: null,
	locale: null,
	section: null,
	publishedTime: null,
	modifiedTime: null,
};

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
				...EMPTY_ARTICLE_FIELDS,
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
				...EMPTY_ARTICLE_FIELDS,
				title: null,
				description: null,
				image: null,
			},
		});
	});

	it.each(['article', 'og:article'])(
		'collects %s metadata and preserves repeated tags',
		async (prefix) => {
			const { result } = await ogs({
				customMetaTags: ARTICLE_META_TAGS,
				html: `<html><head>
					<meta property="og:site_name" content="Example Magazine" />
					<meta property="og:type" content="article" />
					<meta property="og:locale" content="en_US" />
					<meta property="${prefix}:author" content=" Ada Lovelace " />
					<meta property="${prefix}:section" content="Technology" />
					<meta property="${prefix}:published_time" content="2026-09-01T12:00:00Z" />
					<meta property="${prefix}:modified_time" content="2026-09-02T12:00:00Z" />
					<meta property="${prefix}:tag" content=" React " />
					<meta property="${prefix}:tag" content="TypeScript" />
					<meta property="${prefix}:tag" content="React" />
					<meta property="${prefix}:tag" content=" " />
				</head></html>`,
			});

			const meta = mapOgObjectToMeta(result, PAGE_URL);

			expect(meta.author).toBe('Ada Lovelace');
			expect(meta.openGraph).toMatchObject({
				author: 'Ada Lovelace',
				tags: ['React', 'TypeScript'],
				siteName: 'Example Magazine',
				type: 'article',
				locale: 'en_US',
				section: 'Technology',
				publishedTime: '2026-09-01T12:00:00Z',
				modifiedTime: '2026-09-02T12:00:00Z',
			});
		},
	);

	it('accepts metadata saved before article fields were supported', () => {
		const saved = { title: 'Saved title', description: null, image: null };
		expect(OpenGraphSchema.parse(saved)).toEqual(saved);
	});
});
