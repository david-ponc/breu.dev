import { createFileRoute } from '@tanstack/react-router';

import { QueryBoundary } from '#/core/ui/query-boundary';
import { LinkDangerZone } from '#/features/links/detail/danger-zone';
import { EditLinkForm } from '#/features/links/detail/edit-form';
import { SettingsSkeleton } from '#/features/links/detail/skeletons';

export const Route = createFileRoute('/dashboard/links/$linkId/settings')({
	component: Page,
});

function Page() {
	const { linkId } = Route.useParams();
	const { session } = Route.useRouteContext();
	const userId = session.user.id;

	return (
		<QueryBoundary fallback={<SettingsSkeleton />}>
			<div className='mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6 pb-6'>
				<EditLinkForm key={linkId} linkId={linkId} userId={userId} />
				<LinkDangerZone linkId={linkId} userId={userId} />
			</div>
		</QueryBoundary>
	);
}
