import type { Meta } from '#/contexts/brevis/links/domain/link';

function cleanText(value: string | null | undefined) {
	return value?.trim() || undefined;
}

export function getLinkPreviewData(meta: Meta | null | undefined) {
	const og = meta?.openGraph;
	const title = cleanText(og?.title) || cleanText(meta?.title);
	const description = cleanText(og?.description) || cleanText(meta?.description);
	const image = og?.image;
	const metadata = [
		{ label: 'Author', value: cleanText(og?.author) || cleanText(meta?.author) },
		{ label: 'Site', value: og?.siteName },
		{ label: 'Type', value: og?.type },
		{ label: 'Locale', value: og?.locale },
		{ label: 'Section', value: og?.section },
		{ label: 'Published', value: og?.publishedTime },
		{ label: 'Modified', value: og?.modifiedTime },
	].flatMap(({ label, value }) => {
		const text = cleanText(value);
		return text ? [{ label, value: text }] : [];
	});
	const tags = [
		...new Set(
			(og?.tags ?? []).flatMap((tag) => {
				const text = cleanText(tag);
				return text ? [text] : [];
			}),
		),
	];
	const hasMetadata = metadata.length > 0 || tags.length > 0;
	const hasPreview = Boolean(title || description || image || hasMetadata);

	return { title, description, image, metadata, tags, hasMetadata, hasPreview };
}
