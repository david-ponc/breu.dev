import type { Meta } from '#/contexts/brevis/links/domain/link';

function cleanText(value: string | null | undefined) {
	return value?.trim() || null;
}

export function getLinkPreviewData(meta: Meta | null | undefined): Meta {
	const og = meta?.openGraph;
	const title = cleanText(og?.title) || cleanText(meta?.title);
	const description = cleanText(og?.description) || cleanText(meta?.description);
	const author = cleanText(og?.author) || cleanText(meta?.author);
	const tags = [
		...new Set(
			(og?.tags ?? []).flatMap((tag) => {
				const text = cleanText(tag);
				return text ? [text] : [];
			}),
		),
	];

	return {
		author,
		favicon: meta?.favicon ?? null,
		title,
		description,
		openGraph: og
			? {
					title,
					description,
					image: og.image ?? null,
					author,
					tags,
					siteName: cleanText(og.siteName),
					type: cleanText(og.type),
					locale: cleanText(og.locale),
					section: cleanText(og.section),
					publishedTime: cleanText(og.publishedTime),
					modifiedTime: cleanText(og.modifiedTime),
				}
			: null,
	};
}
