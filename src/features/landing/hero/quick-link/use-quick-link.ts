import { useCallback, useState } from 'react';

import { authClient } from '#/core/lib/auth/client';
import {
	isAnonymousActionForbidden,
	useRequireAccountPrompt,
} from '#/core/lib/auth/require-account';
import { httpClient } from '#/core/lib/http/client';
import { Identifier } from '#/core/lib/identifier';
import { ensureHttpsProtocol } from '#/core/lib/url';
import { toastManager } from '#/core/ui/toast';

import { QuickLinkValuesSchema } from './schema';

export type QuickLinkStatus = 'idle' | 'creating' | 'success';

export interface CreatedQuickLink {
	linkId: string;
	slug: string;
	url: string;
}

interface QuickLinkFailure {
	message?: string;
	status?: number;
	code?: string;
}

export function useQuickLink() {
	const [status, setStatus] = useState<QuickLinkStatus>('idle');
	const [inputError, setInputError] = useState<string | null>(null);
	const [created, setCreated] = useState<CreatedQuickLink | null>(null);
	const requireAccount = useRequireAccountPrompt();

	const submit = useCallback(
		async (rawUrl: string) => {
			if (status === 'creating') return;

			const url = ensureHttpsProtocol(rawUrl);
			const parsed = QuickLinkValuesSchema.safeParse({ url });

			if (!parsed.success) {
				setInputError('That does not look like a valid URL. Check it and try again.');
				return;
			}

			setInputError(null);
			setStatus('creating');

			try {
				await ensureSession();

				const slugResult = await httpClient().brevis.links.slugs.get();
				const slugData = slugResult.data;
				if (!slugData || !('slug' in slugData)) {
					throw linkError(
						slugResult.error?.value,
						'Could not reserve a slug. Try again.',
					);
				}

				const linkId = Identifier.generate();
				const linkResult = await httpClient()
					.brevis.links({ id: linkId })
					.put({ url, slug: slugData.slug, comments: '', meta: null });
				const link = linkResult.data;
				if (!link || !('slug' in link)) {
					if (isAnonymousActionForbidden(linkResult.error?.value)) {
						setStatus('idle');
						requireAccount(
							'Guests can create one link. Sign up to create and manage more.',
						);
						return;
					}

					throw linkError(
						linkResult.error?.value,
						'Could not create your link. Try again.',
					);
				}

				setCreated({ linkId, slug: link.slug, url: link.url });
				setStatus('success');
			} catch (cause) {
				setStatus('idle');

				if (isRateLimited(cause)) {
					setInputError('You just created too many links. Try again in an hour.');
					return;
				}

				toastManager.add({
					type: 'error',
					title: 'Failed to craft link',
					description:
						cause instanceof Error
							? cause.message
							: ((cause as QuickLinkFailure | undefined)?.message ??
								'We could not reach that page. Check the URL and try again.'),
				});
			}
		},
		[status, requireAccount],
	);

	const reset = useCallback(() => {
		setStatus('idle');
		setInputError(null);
		setCreated(null);
	}, []);

	return { status, inputError, created, submit, reset };
}

async function ensureSession() {
	const { data: session } = await authClient.getSession();
	if (session?.session) return;

	const { error } = await authClient.signIn.anonymous();
	if (!error) return;

	if (error.code === 'ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY') return;

	throw error;
}

function linkError(value: unknown, fallback: string): Error {
	const failure = value as QuickLinkFailure | undefined;

	if (failure?.code === 'LINK_META_COLLECTION_FAILED') {
		return new Error('We could not read that page. Check the URL and try again.');
	}

	return new Error(failure?.message || fallback);
}

function isRateLimited(cause: unknown) {
	if (!cause || typeof cause !== 'object') return false;
	const { status, message } = cause as QuickLinkFailure;
	if (status === 429) return true;
	return typeof message === 'string' && message.includes('Too many anonymous sign-ins');
}
