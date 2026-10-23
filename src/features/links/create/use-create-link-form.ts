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

			await toastManager.promise(httpClient().brevis.links({ id: link.id }).put(link), {
				loading: {
					title: 'Crafting your link...',
					description: 'Please wait while we create your link.',
				},
				error: (error) => {
					if (isAnonymousActionForbidden(error)) {
						requireAccount('Guests can create one link. Sign up to manage more.');
						return {
							title: 'Create a free account',
							description: 'Sign up to create more links.',
						};
					}

					return {
						title: 'Failed to craft link',
						description: getLinkErrorMessage(error),
					};
				},
				success: (data) => {
					if (data.error) throw data.error;
					void queryClient.invalidateQueries({ queryKey: ['links'] });
					navigate({
						to: '/dashboard/links/$linkId',
						params: { linkId: link.id },
					});
					return {
						title: 'Link crafted successfully',
						description: `Your link has been crafted successfully`,
					};
				},
			});
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
		} catch {
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
