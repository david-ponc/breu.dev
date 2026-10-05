export class AnonymousActionForbiddenError extends Error {
	constructor() {
		super('Create a free account to keep managing your links.');
		this.name = 'AnonymousActionForbiddenError';
	}
}
