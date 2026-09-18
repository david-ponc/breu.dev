import { Link, useLocation } from '@tanstack/react-router';

import { Tabs } from '#/core/ui/tabs';

export function Navbar() {
	const location = useLocation();
	const activeTab = location.pathname === '/dashboard/links' ? 'links' : null;

	return (
		<Tabs.Root value={activeTab} className='grow'>
			<Tabs.List aria-label='Dashboard sections'>
				<Tabs.Tab
					value='links'
					nativeButton={false}
					render={<Link to='/dashboard/links' />}
				>
					Links
				</Tabs.Tab>
				<Tabs.Indicator renderBeforeHydration />
			</Tabs.List>
		</Tabs.Root>
	);
}
