import { queryOptions } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';

import { httpClient } from '#/core/lib/http/client';

import { type ActivityRange, activityWindow } from './range';

const fetchLink = createIsomorphicFn()
	.server(async (linkId: string) => {
		const { getRequestHeaders } = await import('@tanstack/react-start/server');
		return httpClient()
			.brevis.links({ id: linkId })
			.get({ headers: getRequestHeaders() });
	})
	.client((linkId: string) => httpClient().brevis.links({ id: linkId }).get());

const fetchStats = createIsomorphicFn()
	.server(async (linkId: string, since: string, until: string) => {
		const { getRequestHeaders } = await import('@tanstack/react-start/server');
		return httpClient()
			.analytics.links({ id: linkId })
			.get({ query: { since, until }, headers: getRequestHeaders() });
	})
	.client((linkId: string, since: string, until: string) =>
		httpClient().analytics.links({ id: linkId }).get({ query: { since, until } }),
	);

const fetchVisits = createIsomorphicFn()
	.server(async (linkId: string) => {
		const { getRequestHeaders } = await import('@tanstack/react-start/server');
		return httpClient()
			.analytics.links({ id: linkId })
			.visits.get({ query: { limit: 50 }, headers: getRequestHeaders() });
	})
	.client((linkId: string) =>
		httpClient()
			.analytics.links({ id: linkId })
			.visits.get({ query: { limit: 50 } }),
	);

export function userLinkQueryKey(userId: string, linkId: string) {
	return ['links', userId, linkId] as const;
}

export function linkStatsQueryKey(userId: string, linkId: string, range: ActivityRange) {
	return ['link-stats', userId, linkId, range] as const;
}

export function linkVisitsQueryKey(userId: string, linkId: string) {
	return ['link-visits', userId, linkId] as const;
}

export function userLinkQueryOptions(userId: string, linkId: string) {
	return queryOptions({
		queryKey: userLinkQueryKey(userId, linkId),
		queryFn: async () => {
			const { data, error } = await fetchLink(linkId);
			if (error && 'status' in error && error.status === 404) throw notFound();
			if (error) throw new Error('Unable to load this link. Please try again.');
			if (!data) throw new Error('The link response was empty. Please try again.');
			return data;
		},
	});
}

export function linkStatsQueryOptions(
	userId: string,
	linkId: string,
	range: ActivityRange,
) {
	return queryOptions({
		queryKey: linkStatsQueryKey(userId, linkId, range),
		queryFn: async () => {
			const { since, until } = activityWindow(range);
			const { data, error } = await fetchStats(linkId, since, until);
			if (error) throw new Error('Unable to load link analytics. Please try again.');
			if (!data) throw new Error('The analytics response was empty. Please try again.');
			return data;
		},
	});
}

export function linkVisitsQueryOptions(userId: string, linkId: string) {
	return queryOptions({
		queryKey: linkVisitsQueryKey(userId, linkId),
		queryFn: async () => {
			const { data, error } = await fetchVisits(linkId);
			if (error) throw new Error('Unable to load recent visits. Please try again.');
			if (!data) throw new Error('The visits response was empty. Please try again.');
			return data;
		},
	});
}
