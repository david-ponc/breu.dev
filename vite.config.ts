import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		tailwindcss(),
		tanstackStart(),
		nitro({
			preset: 'vercel',
			serverDir: './server',
			rollupConfig: { external: [/^@sentry\//] },
			vercel: {
				functions: { runtime: 'nodejs22.x' },
				queues: {
					triggers: [{ topic: 'domain-events' }],
				},
			},
		}),
		viteReact(),
	],
});

export default config;
