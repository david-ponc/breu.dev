import { createFileRoute } from '@tanstack/react-router';

import { LandingPage } from '#/features/landing/landing-page';

export const Route = createFileRoute('/')({
	component: LandingPage,
	head: () => ({
		meta: [
			{ title: 'breu.dev — Short links. Clear insights.' },
			{
				name: 'description',
				content:
					'Shorten your links, follow their activity, and manage everything in one place.',
			},
		],
	}),
});
