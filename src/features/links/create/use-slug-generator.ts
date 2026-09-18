import { useMutation } from '@tanstack/react-query';

import { httpClient } from '#/core/lib/http/client';

export function useSlugGenerator() {
	return useMutation({
		mutationFn: async () => await httpClient().brevis.links.slugs.get(),
	});
}
