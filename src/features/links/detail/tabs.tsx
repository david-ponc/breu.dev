import { Link, useLocation } from '@tanstack/react-router';

import { Segmented } from '#/core/ui/segmented';

interface LinkDetailTabsProps {
	linkId: string;
}

function activeTab(pathname: string) {
	if (pathname.endsWith('/settings')) return 'settings';
	if (pathname.endsWith('/visits')) return 'visits';
	return 'overview';
}

export function LinkDetailTabs({ linkId }: LinkDetailTabsProps) {
	const { pathname } = useLocation();

	return (
		<Segmented.Root value={activeTab(pathname)}>
			<Segmented.List aria-label='Link sections'>
				<Segmented.Item
					value='overview'
					nativeButton={false}
					render={<Link to='/dashboard/links/$linkId' params={{ linkId }} />}
				>
					Overview
				</Segmented.Item>
				<Segmented.Item
					value='visits'
					nativeButton={false}
					render={<Link to='/dashboard/links/$linkId/visits' params={{ linkId }} />}
				>
					Recent visits
				</Segmented.Item>
				<Segmented.Item
					value='settings'
					nativeButton={false}
					render={<Link to='/dashboard/links/$linkId/settings' params={{ linkId }} />}
				>
					Settings
				</Segmented.Item>
				<Segmented.Indicator renderBeforeHydration />
			</Segmented.List>
		</Segmented.Root>
	);
}
