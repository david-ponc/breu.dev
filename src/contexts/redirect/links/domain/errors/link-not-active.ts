export class LinkNotActiveError extends Error {
	constructor(slug: string) {
		super(`Link "${slug}" is not active`);
		this.name = 'LinkNotActiveError';
	}
}
