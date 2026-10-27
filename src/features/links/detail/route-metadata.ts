type RouteMatch = {
	routeId: string;
	loaderData?: unknown;
};

export function getLinkSlugFromMatches(matches: readonly RouteMatch[]) {
	const detailMatch = matches.find(
		(match) => match.routeId === '/dashboard/links/$linkId',
	);
	const loaderData = detailMatch?.loaderData as { slug?: unknown } | undefined;

	return typeof loaderData?.slug === 'string' ? loaderData.slug : 'link';
}
