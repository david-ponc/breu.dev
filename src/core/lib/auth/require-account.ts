import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

import { toastManager } from '#/core/ui/toast';

export const ANONYMOUS_ACTION_FORBIDDEN_CODE = 'LINK_ANONYMOUS_ACTION_FORBIDDEN';

export interface HttpFailure {
	status?: number;
	code?: string;
	message?: string;
}

export function isAnonymousActionForbidden(cause: unknown): boolean {
	if (!cause || typeof cause !== 'object') return false;

	const { status, code } = cause as HttpFailure;
	const value = 'value' in cause ? (cause.value as HttpFailure | undefined) : undefined;

	return (
		code === ANONYMOUS_ACTION_FORBIDDEN_CODE ||
		value?.code === ANONYMOUS_ACTION_FORBIDDEN_CODE ||
		status === 403
	);
}

export function useRequireAccountPrompt() {
	const navigate = useNavigate();

	return useCallback(
		(description: string) => {
			toastManager.add({
				type: 'info',
				title: 'Create a free account',
				description,
				timeout: 8000,
				actionProps: {
					children: 'Create account',
					onClick: () => navigate({ to: '/auth/sign-in' }),
				},
			});
		},
		[navigate],
	);
}
