import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

import { Icon } from '#/core/icons/icon';
import { Button } from '#/core/ui/button';
import { Empty } from '#/core/ui/empty';
import { PageTransition } from '#/core/ui/motion';
import { QueryBoundary } from '#/core/ui/query-boundary';
import { LinkDetailHeader } from '#/features/links/detail/header';
import { userLinkQueryOptions } from '#/features/links/detail/query';
import { HeaderSkeleton } from '#/features/links/detail/skeletons';
import { LinkDetailTabs } from '#/features/links/detail/tabs';

export const Route = createFileRoute('/dashboard/links/$linkId')({
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			userLinkQueryOptions(context.session.user.id, params.linkId),
		);
	},
	component: Layout,
	notFoundComponent: NotFound,
});

function Layout() {
	const { linkId } = Route.useParams();
	const { session } = Route.useRouteContext();
	const userId = session.user.id;

	return (
		<div className='flex min-w-0 flex-col gap-6'>
			<div className='flex min-w-0 flex-col gap-4'>
				<QueryBoundary fallback={<HeaderSkeleton />}>
					<LinkDetailHeader linkId={linkId} userId={userId} />
				</QueryBoundary>
				<LinkDetailTabs linkId={linkId} />
			</div>
			<PageTransition>
				<Outlet />
			</PageTransition>
		</div>
	);
}

function NotFound() {
	return (
		<Empty.Root>
			<Empty.Header>
				<Empty.Title>Link not found</Empty.Title>
				<Empty.Description>
					This link does not exist or you do not have access to it.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button render={<Link to='/dashboard/links' />}>
					<Icon name='chevron-left' data-icon='inline-start' />
					Back to links
				</Button>
			</Empty.Content>
		</Empty.Root>
	);
}
