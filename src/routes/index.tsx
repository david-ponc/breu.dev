import { createFileRoute } from '@tanstack/react-router';

import { HeroSection } from '#/features/landing/hero';

export const Route = createFileRoute('/')({
	component: HeroSection,
	head: () => ({
		meta: [
			{ title: 'breu.dev — Shorten any link in one click' },
			{
				name: 'description',
				content:
					'Paste a long URL and get a clean, shareable link. No account, no friction.',
			},
		],
	}),
});
