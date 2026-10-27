import { useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import type { Link } from '#/contexts/brevis/links/domain/link';
import {
	isAnonymousActionForbidden,
	useRequireAccountPrompt,
} from '#/core/lib/auth/require-account';
import { useAppForm } from '#/core/lib/form';
import { httpClient } from '#/core/lib/http/client';
import { toastManager } from '#/core/ui/toast';
import {
	type CreateLinkValues,
	CreateLinkValuesSchema,
} from '#/features/links/create/schema';
import {
	useAiSlugGenerator,
	useSlugGenerator,
} from '#/features/links/create/use-slug-generator';
import { getLinkErrorMessage } from '#/features/links/link-error-message';

import { userLinksQueryKey } from '../table/query';
import { userLinkQueryKey } from './query';

export function useEditLinkForm(link: Link) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const requireAccount = useRequireAccountPrompt();
	const slugGenerator = useSlugGenerator();
	const aiSlugGenerator = useAiSlugGenerator();
	const form = useAppForm({
		defaultValues: {
			url: link.url,
			slug: link.slug,
			comments: link.comments,
			meta: link.meta,
		} as CreateLinkValues,
		validators: {
			onSubmit: CreateLinkValuesSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toastManager.add({
				type: 'loading',
				title: 'Saving changes...',
				description: 'Please wait while we update your link.',
				timeout: 0,
			});

			try {
				const result = await httpClient().brevis.links({ id: link.id }).put({
					slug: value.slug,
					url: value.url,
					comments: value.comments,
					meta: value.meta,
				});
				if (result.error) throw result.error;

				if (result.data) {
					queryClient.setQueryData(userLinkQueryKey(link.userId, link.id), result.data);
				}

				void queryClient.invalidateQueries({
					queryKey: userLinksQueryKey(link.userId),
					exact: true,
				});

				toastManager.update(toastId, {
					type: 'success',
					title: 'Link updated',
					description: `/${value.slug} has been saved.`,
					timeout: 4000,
				});

				void router.invalidate({
					filter: (match) => match.routeId === '/dashboard/links/$linkId',
				});
			} catch (error) {
				if (isAnonymousActionForbidden(error)) {
					requireAccount('Create an account to keep and edit your link.', {
						toastId,
						title: 'Create a free account',
						description: 'Sign up to keep and edit your link.',
					});
					return;
				}

				toastManager.update(toastId, {
					type: 'error',
					title: 'Failed to update link',
					description: getLinkErrorMessage(error),
					timeout: 4000,
				});
			}
		},
	});

	const withValidUrl = useStore(form.store, (state) =>
		Boolean(state.fieldMeta.url?.isValid && state.values.url),
	);
	const isGenerating = slugGenerator.isPending || aiSlugGenerator.isPending;

	const generateSlug = async () => {
		if (!withValidUrl || isGenerating) return false;

		const { data } = await slugGenerator.mutateAsync();

		if (data?.slug) {
			form.setFieldValue('slug', data.slug);
			return true;
		}

		return false;
	};

	const generateAiSlug = async () => {
		const url = form.store.state.values.url;
		if (!withValidUrl || !url || isGenerating) return false;

		try {
			const { slug } = await aiSlugGenerator.mutateAsync(url);
			form.setFieldValue('slug', slug);
			return true;
		} catch (error) {
			if (isAnonymousActionForbidden(error)) {
				requireAccount('Create an account to generate AI slug suggestions.', {
					title: 'Create a free account',
					description: 'Sign up to generate AI slug suggestions.',
				});
				return false;
			}

			toastManager.add({
				type: 'error',
				title: 'Could not generate an AI slug',
				description: 'Please try again or use the other slug generator.',
			});
			return false;
		}
	};

	return [
		form,
		{
			withValidUrl,
			isGenerating,
			isGeneratingSlug: slugGenerator.isPending,
			isGeneratingAiSlug: aiSlugGenerator.isPending,
		},
		{ generateSlug, generateAiSlug },
	] as const;
}
