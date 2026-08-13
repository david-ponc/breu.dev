export class VisitNotFoundError extends Error {
	constructor(key: string) {
		super(`Visit "${key}" not found`);
		this.name = 'VisitNotFoundError';
	}
}
