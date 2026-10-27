import { useStore } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import {
	isAnonymousActionForbidden,
	useRequireAccountPrompt,
} from '#/core/lib/auth/require-account';
import { useAppForm } from '#/core/lib/form';
import { httpClient } from '#/core/lib/http/client';
import { Identifier } from '#/core/lib/identifier';
import { toastManager } from '#/core/ui/toast';
import { getLinkErrorMessage } from '#/features/links/link-error-message';

import { type CreateLinkValues, CreateLinkValuesSchema } from './schema';
import { useAiSlugGenerator, useSlugGenerator } from './use-slug-generator';

interface Props {
	defaultValues?: Partial<CreateLinkValues>;
}

export function useCreateLinkForm({ defaultValues }: Props) {
	const queryClient = useQueryClient();
	const requireAccount = useRequireAccountPrompt();
	const shouldFetchInitialSlug = !defaultValues?.slug;
	const initialSlugQuery = useQuery({
		queryKey: ['initial-slug'],
		queryFn: () => httpClient().brevis.links.slugs.get(),
		enabled: shouldFetchInitialSlug, // Solo si no hay slug por defecto
	});
	const isInitialSlugPending = shouldFetchInitialSlug && initialSlugQuery.isPending;
	const slugGenerator = useSlugGenerator();
	const aiSlugGenerator = useAiSlugGenerator();
	const navigate = useNavigate();
	const form = useAppForm({
		defaultValues: {
			url: '',
			comments: '',
			meta: null,
			slug: initialSlugQuery.data?.data?.slug || '',
			...defaultValues,
		} as CreateLinkValues,
		validators: {
			onSubmit: CreateLinkValuesSchema,
		},
		onSubmit: async ({ value }) => {
			const link = {
				...value,
				id: Identifier.generate(),
			};

			const toastId = toastManager.add({
				type: 'loading',
				title: 'Crafting your link...',
				description: 'Please wait while we create your link.',
				timeout: 0,
			});

			try {
				const result = await httpClient().brevis.links({ id: link.id }).put(link);
				if (result.error) throw result.error;

				void queryClient.invalidateQueries({ queryKey: ['links'] });
				navigate({
					to: '/dashboard/links/$linkId',
					params: { linkId: link.id },
				});
				toastManager.update(toastId, {
					type: 'success',
					title: 'Link crafted successfully',
					description: 'Your link has been crafted successfully',
					timeout: 4000,
				});
			} catch (error) {
				if (isAnonymousActionForbidden(error)) {
					requireAccount('Create an account to make more links.', {
						toastId,
						title: 'Create a free account',
						description: "You've used your free link. Sign up to create more.",
					});
					return;
				}

				toastManager.update(toastId, {
					type: 'error',
					title: 'Failed to craft link',
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
		if (
			!withValidUrl ||
			(shouldFetchInitialSlug && isInitialSlugPending) ||
			isGenerating
		) {
			return false;
		}

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

	const state = {
		withValidUrl,
		isGenerating,
		isGeneratingSlug: slugGenerator.isPending,
		isGeneratingAiSlug: aiSlugGenerator.isPending,
		isInitialSlugPending,
	};
	const actions = { generateSlug, generateAiSlug };

	return [form, state, actions] as const;
}
