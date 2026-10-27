import { createFileRoute } from '@tanstack/react-router';

import { QueryBoundary } from '#/core/ui/query-boundary';
import { linkVisitsQueryOptions } from '#/features/links/detail/query';
import { getLinkSlugFromMatches } from '#/features/links/detail/route-metadata';
import { VisitsSkeleton } from '#/features/links/detail/skeletons';
import { LinkDetailVisits } from '#/features/links/detail/visits';

export const Route = createFileRoute('/dashboard/links/$linkId/visits')({
	loader: ({ context, params }) => {
		void context.queryClient.prefetchQuery(
			linkVisitsQueryOptions(context.session.user.id, params.linkId),
		);
	},
	component: Page,
	head: ({ matches }) => {
		const slug = getLinkSlugFromMatches(matches);
		return {
			meta: [
				{ title: `Recent visits of ${slug} | breu.dev` },
				{
					name: 'description',
					content: `Review recent visits of ${slug}, including referrers and device details.`,
				},
			],
		};
	},
});

function Page() {
	const { linkId } = Route.useParams();
	const { session } = Route.useRouteContext();
	const userId = session.user.id;

	return (
		<QueryBoundary fallback={<VisitsSkeleton />}>
			<LinkDetailVisits linkId={linkId} userId={userId} />
		</QueryBoundary>
	);
}
