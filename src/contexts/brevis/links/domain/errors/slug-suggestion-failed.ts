export class SlugSuggestionFailedError extends Error {
	constructor() {
		super('Could not suggest an available slug');
		this.name = 'SlugSuggestionFailedError';
	}
}
