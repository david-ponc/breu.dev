import { useMutation } from '@tanstack/react-query';

import { httpClient } from '#/core/lib/http/client';

export function useSlugGenerator() {
	return useMutation({
		mutationFn: async () => await httpClient().brevis.links.slugs.get(),
	});
}

export function useAiSlugGenerator() {
	return useMutation({
		mutationFn: async (url: string) => {
			const result = await httpClient().brevis.links.slugs.completion.get({
				query: { url },
			});

			if (result.error) throw result.error.value;
			if (!result.data) throw new Error('Could not generate an AI slug');

			return result.data;
		},
	});
}
