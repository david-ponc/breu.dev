import { describe, expect, it } from 'vitest';

import { LINK_ERROR } from '#/contexts/brevis/links/domain/errors/codes';

import { getLinkErrorMessage } from './link-error-message';

describe('getLinkErrorMessage', () => {
	it('uses a clear message when metadata collection fails', () => {
		expect(
			getLinkErrorMessage({
				value: {
					code: LINK_ERROR.MetaCollectionFailed,
					message: 'Failed to collect metadata for "https://example.com"',
				},
			}),
		).toBe('We could not read that page. Check the URL and try again.');
	});

	it('reads the server message from a wrapped error before its message', () => {
		const error = Object.assign(new Error('[object Object]'), {
			value: { message: 'Could not create the link.' },
		});

		expect(getLinkErrorMessage(error)).toBe('Could not create the link.');
	});

	it('preserves regular error messages', () => {
		expect(getLinkErrorMessage(new Error('Request failed'))).toBe('Request failed');
	});

	it('uses a safe fallback when no string message is available', () => {
		expect(getLinkErrorMessage({ message: { detail: 'failure' } })).toBe(
			'An unexpected error occurred.',
		);
	});
});
