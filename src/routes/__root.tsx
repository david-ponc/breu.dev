import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { PropsWithChildren } from 'react';

import { Toaster } from '#/core/ui/toast';

import appCss from '../styles.css?url';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ name: 'color-scheme', content: 'light dark' },
			{ name: 'theme-color', content: '#f4f4f5', media: '(prefers-color-scheme: light)' },
			{ name: 'theme-color', content: '#09090b', media: '(prefers-color-scheme: dark)' },
			{ title: 'breu.dev | Short links and analytics' },
		],
		links: [
			{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
			{ rel: 'icon', href: '/favicon.ico', type: 'image/x-icon', sizes: 'any' },
			{ rel: 'icon', href: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
			{ rel: 'icon', href: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
			{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
			{ rel: 'manifest', href: '/manifest.json' },
			{ rel: 'stylesheet', href: appCss },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: PropsWithChildren) {
	return (
		<html lang='en' className='scroll-smooth'>
			<head>
				<HeadContent />
			</head>
			<body className='flex size-full h-svh flex-col overscroll-none bg-background font-sans text-foreground'>
				{children}
				<Toaster />
				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
