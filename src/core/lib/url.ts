export function stripHttpProtocol(value: string) {
	return value.replace(/^https?:\/\//i, '');
}

export function ensureHttpsProtocol(value: string) {
	const trimmed = value.trim();
	if (!trimmed) return '';

	const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');

	const withoutLeadingSlashes = withoutProtocol.replace(/^\/+/, '');

	return `https://${withoutLeadingSlashes}`;
}
