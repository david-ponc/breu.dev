import { LINK_ERROR } from '#/contexts/brevis/links/domain/errors/codes';

const UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred.';
const META_COLLECTION_FAILED_MESSAGE =
	'We could not read that page. Check the URL and try again.';

interface LinkFailure {
	code?: unknown;
	message?: unknown;
	value?: unknown;
}

function isLinkFailure(value: unknown): value is LinkFailure {
	return typeof value === 'object' && value !== null;
}

export function getLinkErrorMessage(error: unknown): string {
	if (!isLinkFailure(error)) return UNEXPECTED_ERROR_MESSAGE;

	const payload = isLinkFailure(error.value) ? error.value : undefined;
	const code = payload?.code ?? error.code;

	if (code === LINK_ERROR.MetaCollectionFailed) {
		return META_COLLECTION_FAILED_MESSAGE;
	}

	const message = payload?.message ?? error.message;
	if (typeof message === 'string' && message !== '[object Object]') {
		return message;
	}

	return UNEXPECTED_ERROR_MESSAGE;
}
