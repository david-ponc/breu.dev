import { useStore } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { useAppForm } from '#/core/lib/form';
import { httpClient } from '#/core/lib/http/client';
import { Identifier } from '#/core/lib/identifier';
import { toastManager } from '#/core/ui/toast';

import { type CreateLinkValues, CreateLinkValuesSchema } from './schema';
import { useSlugGenerator } from './use-slug-generator';

interface Props {
	defaultValues?: Partial<CreateLinkValues>;
}

export function useCreateLinkForm({ defaultValues }: Props) {
	const queryClient = useQueryClient();
	const { data: initialSlug, isPending: isInitialSlugPending } = useQuery({
		queryKey: ['initial-slug'],
		queryFn: () => httpClient().brevis.links.slugs.get(),
		enabled: !defaultValues?.slug, // Solo si no hay slug por defecto
	});
	const slugGenerator = useSlugGenerator();
	const navigate = useNavigate();
	const form = useAppForm({
		defaultValues: {
			url: '',
			comments: '',
			meta: null,
			slug: initialSlug?.data?.slug || '',
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
					return {
						title: 'Failed to craft link',
						description:
							error instanceof Error ? error.message : 'An unexpected error occurred.',
					};
				},
				success: (data) => {
					if (data.error) throw data.error;
					void queryClient.invalidateQueries({ queryKey: ['links'] });
					navigate({ to: '/dashboard/links' });
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

	const generateSlug = async () => {
		const { data } = await slugGenerator.mutateAsync();

		if (data?.slug) {
			form.setFieldValue('slug', data.slug);
		}
	};

	const isGenerating = slugGenerator.isPending;

	const state = {
		withValidUrl,
		isGenerating,
		isGeneratingSlug: slugGenerator.isPending,
		isInitialSlugPending,
	};
	const actions = { generateSlug };

	return [form, state, actions] as const;
}
