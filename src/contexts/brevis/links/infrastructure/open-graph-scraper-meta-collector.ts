import { Service } from 'diod';
import ogs from 'open-graph-scraper';
import type { OgObject } from 'open-graph-scraper/types';
import z from 'zod';

import { MetaCollectionFailedError } from '#/contexts/brevis/links/domain/errors/meta-collection-failed';
import { type Meta, MetaSchema } from '#/contexts/brevis/links/domain/link';
import type { MetaCollector } from '#/contexts/brevis/links/domain/meta-collector';
import { logger } from '#/core/lib/logging';

const USER_AGENT =
	'Mozilla/5.0 (compatible; BreuBot/1.0; +https://breu.dev) AppleWebKit/537.36 (KHTML, like Gecko)';

function resolveUrl(baseUrl: string, value: string | undefined): string | null {
	if (!value) {
		return null;
	}

	try {
		const href = new URL(value, baseUrl).href;
		return z.url().safeParse(href).success ? href : null;
	} catch {
		return null;
	}
}

function firstDefined(...values: Array<string | undefined>): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value.trim();
		}
	}

	return null;
}

export function mapOgObjectToMeta(result: OgObject, pageUrl: string): Meta {
	const title = firstDefined(
		result.ogTitle,
		result.twitterTitle,
		result.dcTitle,
		result.ogSiteName,
	);
	const description = firstDefined(
		result.ogDescription,
		result.twitterDescription,
		result.dcDescription,
	);
	const author = firstDefined(
		result.author,
		result.articleAuthor,
		result.ogArticleAuthor,
		result.dcCreator,
		result.bookAuthor,
	);
	const favicon = resolveUrl(pageUrl, result.favicon);
	const image = resolveUrl(
		pageUrl,
		result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url ?? result.ogLogo,
	);

	return MetaSchema.parse({
		author,
		favicon,
		title,
		description,
		openGraph: {
			title: firstDefined(result.ogTitle, result.twitterTitle),
			description: firstDefined(result.ogDescription, result.twitterDescription),
			image,
		},
	});
}

@Service()
export class OpenGraphScraperMetaCollector implements MetaCollector {
	async collect(url: string): Promise<Meta> {
		logger.debug({ url }, 'Collecting link metadata');

		try {
			const { error, result } = await ogs({
				url,
				timeout: 10,
				fetchOptions: {
					headers: {
						'user-agent': USER_AGENT,
						accept: 'text/html,application/xhtml+xml',
					},
				},
			});

			if (error) {
				throw new MetaCollectionFailedError(url, result.errorDetails);
			}

			const meta = mapOgObjectToMeta(result, url);
			logger.debug({ url, title: meta.title }, 'Link metadata collected');
			return meta;
		} catch (cause) {
			if (cause instanceof MetaCollectionFailedError) {
				throw cause;
			}

			logger.error({ err: cause, url }, 'Failed to collect link metadata');
			throw new MetaCollectionFailedError(url, cause);
		}
	}
}
