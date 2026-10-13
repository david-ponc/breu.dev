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
import { getLinkErrorMessage } from '#/features/links/link-error-message';

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

				void queryClient.invalidateQueries({ queryKey: ['links'] });
				toastManager.update(toastId, {
					type: 'success',
					title: 'Link updated',
					description: `/${value.slug} has been saved.`,
				});
			} catch (error) {
				if (isAnonymousActionForbidden(error)) {
					requireAccount(
						'Guests cannot edit links. Sign up to keep your link and edit it.',
						{
							toastId,
							title: 'Keep your link',
							description: 'Create a free account to edit it.',
						},
					);
					return;
				}

				toastManager.update(toastId, {
					type: 'error',
					title: 'Failed to update link',
					description: getLinkErrorMessage(error),
				});
			}
		},
	});

	const generateSlug = async () => {
		const { data } = await slugGenerator.mutateAsync();
		if (data?.slug) form.setFieldValue('slug', data.slug);
	};

	return [form, { isGeneratingSlug: slugGenerator.isPending }, { generateSlug }] as const;
}
