import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveLandingState } from './get-landing-state';

describe('resolveLandingState', () => {
	const countByUserId = vi.fn().mockResolvedValue(0);

	beforeEach(() => vi.clearAllMocks());

	it('returns the guest state without querying links when there is no session', async () => {
		await expect(resolveLandingState(null, countByUserId)).resolves.toEqual({
			isSignedIn: false,
			hasUsedGuestLink: false,
		});
		expect(countByUserId).not.toHaveBeenCalled();
	});

	it('keeps the form available for account users without querying their links', async () => {
		await expect(
			resolveLandingState({ user: { id: 'user-1', isAnonymous: false } }, countByUserId),
		).resolves.toEqual({
			isSignedIn: true,
			hasUsedGuestLink: false,
		});
		expect(countByUserId).not.toHaveBeenCalled();
	});

	it('detects when an anonymous user already used the guest link', async () => {
		countByUserId.mockResolvedValue(1);

		await expect(
			resolveLandingState({ user: { id: 'guest-1', isAnonymous: true } }, countByUserId),
		).resolves.toEqual({
			isSignedIn: false,
			hasUsedGuestLink: true,
		});
		expect(countByUserId).toHaveBeenCalledWith('guest-1');
	});
});
