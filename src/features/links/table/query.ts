import { queryOptions } from '@tanstack/react-query';
import { createIsomorphicFn } from '@tanstack/react-start';

import { httpClient } from '#/core/lib/http/client';

const fetchLinks = createIsomorphicFn()
	.server(async () => {
		const { getRequestHeaders } = await import('@tanstack/react-start/server');
		return httpClient().brevis.links.get({ headers: getRequestHeaders() });
	})
	.client(() => httpClient().brevis.links.get());

export const userLinksQueryKey = (userId: string) => ['links', userId] as const;

export function userLinksQueryOptions(userId: string) {
	return queryOptions({
		queryKey: userLinksQueryKey(userId),
		queryFn: async () => {
			const { data, error } = await fetchLinks();
			if (error) throw new Error('Unable to load your links. Please try again.');
			if (!data) throw new Error('The links response was empty. Please try again.');
			return data;
		},
	});
}
