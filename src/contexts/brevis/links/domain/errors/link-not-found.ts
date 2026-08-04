export class LinkNotFoundError extends Error {
	constructor(key: string) {
		super(`Link "${key}" not found`);
		this.name = 'LinkNotFoundError';
	}
}
