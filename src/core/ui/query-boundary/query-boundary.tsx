import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Component, type ReactNode, Suspense } from 'react';

import { AlertIcon } from '#/core/icons/alert';
import { RefreshIcon } from '#/core/icons/refresh';
import { Button } from '#/core/ui/button';
import { Empty } from '#/core/ui/empty';

class ResetErrorBoundary extends Component<
	{
		onReset: () => void;
		fallback: (retry: () => void) => ReactNode;
		children: ReactNode;
	},
	{ error: Error | null }
> {
	state: { error: Error | null } = { error: null };

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	retry = () => {
		this.props.onReset();
		this.setState({ error: null });
	};

	render() {
		if (this.state.error) {
			return this.props.fallback(this.retry);
		}

		return this.props.children;
	}
}

function DefaultErrorFallback(retry: () => void) {
	return (
		<Empty.Root role='alert' className='py-10 md:py-12'>
			<Empty.Media variant='icon'>
				<AlertIcon />
			</Empty.Media>
			<Empty.Header>
				<Empty.Title>Unable to load</Empty.Title>
				<Empty.Description>Something went wrong. Please try again.</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button variant='outline' onClick={retry}>
					<RefreshIcon />
					Try again
				</Button>
			</Empty.Content>
		</Empty.Root>
	);
}

interface QueryBoundaryProps {
	fallback: ReactNode;
	errorFallback?: (retry: () => void) => ReactNode;
	children: ReactNode;
}

export function QueryBoundary({
	fallback,
	errorFallback = DefaultErrorFallback,
	children,
}: QueryBoundaryProps) {
	return (
		<QueryErrorResetBoundary>
			{({ reset }) => (
				<ResetErrorBoundary onReset={reset} fallback={errorFallback}>
					<Suspense fallback={fallback}>{children}</Suspense>
				</ResetErrorBoundary>
			)}
		</QueryErrorResetBoundary>
	);
}
