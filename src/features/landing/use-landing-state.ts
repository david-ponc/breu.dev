import { getRouteApi } from '@tanstack/react-router';

const landingRoute = getRouteApi('/');

export function useLandingState() {
	return landingRoute.useLoaderData();
}
