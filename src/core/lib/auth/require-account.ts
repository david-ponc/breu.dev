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
		(description: string, options: RequireAccountPromptOptions = {}) => {
			const toastOptions = {
				type: 'info',
				title: options.title ?? 'Create a free account',
				description: options.description ?? description,
				timeout: 8000,
				data: { layout: 'account-prompt' },
				actionProps: {
					children: 'Create account',
					onClick: () => navigate({ to: '/auth/sign-in' }),
				},
			};

			if (options.toastId) {
				toastManager.update(options.toastId, toastOptions);
				return;
			}

			toastManager.add(toastOptions);
		},
		[navigate],
	);
}

export interface RequireAccountPromptOptions {
	toastId?: string;
	title?: string;
	description?: string;
}
