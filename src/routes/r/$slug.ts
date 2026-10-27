import { createFileRoute } from '@tanstack/react-router';

import { app } from '#/core/lib/http/app.server';
import { presentRedirectResponse } from '#/features/redirect/redirect-response';

const handle = async ({
	request,
	params,
}: {
	request: Request;
	params: { slug: string };
}) => {
	const url = new URL(request.url);
	url.pathname = `/api/redirect/links/${encodeURIComponent(params.slug)}`;

	const response = await app.fetch(new Request(url, request));
	return presentRedirectResponse(response);
};

export const Route = createFileRoute('/r/$slug')({
	server: {
		handlers: {
			GET: handle,
		},
	},
});
