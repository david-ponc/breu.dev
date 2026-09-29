import { createFileRoute } from '@tanstack/react-router';

import { app } from '#/core/lib/http/app.server';

const handle = ({ request, params }: { request: Request; params: { slug: string } }) => {
	const url = new URL(request.url);
	url.pathname = `/api/redirect/links/${encodeURIComponent(params.slug)}`;

	return app.fetch(new Request(url, request));
};

export const Route = createFileRoute('/r/$slug')({
	server: {
		handlers: {
			GET: handle,
		},
	},
});
