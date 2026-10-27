export async function presentRedirectResponse(response: Response): Promise<Response> {
	if (response.status !== 404 && response.status !== 410) {
		return response;
	}

	await response.body?.cancel();

	const [{ renderToStaticMarkup }, { RedirectNotFoundPage }, { default: appCss }] =
		await Promise.all([
			import('react-dom/server'),
			import('./redirect-not-found-page'),
			import('../../styles.css?url'),
		]);

	const html = `<!doctype html>${renderToStaticMarkup(
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='noindex' />
				<title>Page not found | breu.dev</title>
				<link rel='stylesheet' href={appCss} />
			</head>
			<body className='flex size-full min-h-svh flex-col overscroll-none bg-background font-sans text-foreground'>
				<RedirectNotFoundPage />
			</body>
		</html>,
	)}`;

	return new Response(html, {
		status: 404,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
			'X-Robots-Tag': 'noindex',
		},
	});
}
