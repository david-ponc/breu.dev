export class LinkSlugUnavailableError extends Error {
	constructor(slug: string) {
		super(`The slug "${slug}" is not available`);
		this.name = 'LinkSlugUnavailableError';
	}
}
