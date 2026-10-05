import { useQueryClient } from '@tanstack/react-query';

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
import { useSlugGenerator } from '#/features/links/create/use-slug-generator';

export function useEditLinkForm(link: Link) {
	const queryClient = useQueryClient();
	const requireAccount = useRequireAccountPrompt();
	const slugGenerator = useSlugGenerator();
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
			await toastManager.promise(
				httpClient().brevis.links({ id: link.id }).put({
					slug: value.slug,
					url: value.url,
					comments: value.comments,
					meta: value.meta,
				}),
				{
					loading: {
						title: 'Saving changes...',
						description: 'Please wait while we update your link.',
					},
					error: (error) => {
						if (isAnonymousActionForbidden(error)) {
							requireAccount(
								'Guests cannot edit links. Sign up to keep your link and edit it.',
							);
							return {
								title: 'Create a free account',
								description: 'Sign up to edit your links.',
							};
						}

						return {
							title: 'Failed to update link',
							description:
								error instanceof Error ? error.message : 'An unexpected error occurred.',
						};
					},
					success: (data) => {
						if (data.error) throw data.error;
						void queryClient.invalidateQueries({ queryKey: ['links'] });
						return {
							title: 'Link updated',
							description: `/${value.slug} has been saved.`,
						};
					},
				},
			);
		},
	});

	const generateSlug = async () => {
		const { data } = await slugGenerator.mutateAsync();
		if (data?.slug) form.setFieldValue('slug', data.slug);
	};

	return [form, { isGeneratingSlug: slugGenerator.isPending }, { generateSlug }] as const;
}
