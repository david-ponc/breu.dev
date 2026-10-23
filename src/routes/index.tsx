import { createFileRoute } from '@tanstack/react-router';

import { getSession } from '#/core/lib/auth/functions';
import { LandingPage } from '#/features/landing/landing-page';

export const Route = createFileRoute('/')({
	loader: async () => {
		const session = await getSession();
		return { isSignedIn: Boolean(session && !session.user.isAnonymous) };
	},
	component: Page,
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

function Page() {
	const { isSignedIn } = Route.useLoaderData();
	return <LandingPage isSignedIn={isSignedIn} />;
}
