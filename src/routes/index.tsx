import { createFileRoute } from '@tanstack/react-router';

import { clientEnv } from '#/config/env/client';
import { getLandingState } from '#/features/landing/get-landing-state';
import { LandingPage } from '#/features/landing/landing-page';

const siteUrl = new URL('/', clientEnv.VITE_BASE_URL).href;

export const Route = createFileRoute('/')({
	loader: () => getLandingState(),
	component: Page,
	head: () => ({
		meta: [
			{ title: 'Short links. Clear insights. | breu.dev' },
			{
				name: 'description',
				content:
					'Shorten links, track clicks and understand where your visitors come from—all in one place.',
			},
			{ property: 'og:site_name', content: 'breu.dev' },
			{ property: 'og:title', content: 'Short links. Clear insights. | breu.dev' },
			{
				property: 'og:description',
				content:
					'Shorten links, track clicks and understand where your visitors come from—all in one place.',
			},
			{ property: 'og:type', content: 'website' },
			{ property: 'og:url', content: siteUrl },
			{ name: 'twitter:card', content: 'summary' },
			{ name: 'twitter:title', content: 'Short links. Clear insights. | breu.dev' },
			{
				name: 'twitter:description',
				content:
					'Shorten links, track clicks and understand where your visitors come from—all in one place.',
			},
		],
		links: [{ rel: 'canonical', href: siteUrl }],
	}),
});

function Page() {
	return <LandingPage />;
}
