export class MetaCollectionFailedError extends Error {
	constructor(url: string, cause?: unknown) {
		super(`Failed to collect metadata for "${url}"`);
		this.name = 'MetaCollectionFailedError';
		if (cause instanceof Error) {
			this.cause = cause;
		}
	}
}
