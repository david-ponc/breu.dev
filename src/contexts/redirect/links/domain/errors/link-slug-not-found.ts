export class LinkSlugNotFoundError extends Error {
	constructor(slug: string) {
		super(`Slug "${slug}" not found`);
		this.name = 'LinkSlugNotFoundError';
	}
}
