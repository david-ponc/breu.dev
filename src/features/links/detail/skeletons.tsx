import { Card } from '#/core/ui/card';
import { Skeleton } from '#/core/ui/skeleton';

export function HeaderSkeleton() {
	return (
		<header className='flex flex-col gap-4'>
			<Skeleton className='h-9 w-20' />
			<div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex min-w-0 flex-col gap-2'>
					<Skeleton className='h-8 w-40' />
					<Skeleton className='h-4 w-64' />
					<Skeleton className='h-4 w-48' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-9 w-16' />
					<Skeleton className='h-9 w-16' />
				</div>
			</div>
		</header>
	);
}

export function KpisSkeleton() {
	return (
		<div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
			{Array.from({ length: 4 }).map((_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
				<Card.Root key={index} size='sm'>
					<Card.Header>
						<Skeleton className='h-4 w-16' />
					</Card.Header>
					<Card.Panel>
						<Skeleton className='h-7 w-20' />
					</Card.Panel>
				</Card.Root>
			))}
		</div>
	);
}

export function ChartSkeleton() {
	return (
		<Card.Root className='min-w-0'>
			<Card.Header className='flex flex-wrap items-center justify-between gap-3'>
				<div className='flex flex-col gap-1'>
					<Skeleton className='h-5 w-24' />
					<Skeleton className='h-4 w-36' />
				</div>
				<Skeleton className='h-9 w-40' />
			</Card.Header>
			<Card.Panel>
				<Skeleton className='h-65 w-full' />
			</Card.Panel>
		</Card.Root>
	);
}

export function PreviewSkeleton() {
	return (
		<Card.Root className='max-h-144 min-w-0 pt-0 lg:max-h-88'>
			<Skeleton className='aspect-video max-h-48 w-full shrink-0 rounded-none' />
			<Card.Header>
				<Skeleton className='h-5 w-40' />
				<Skeleton className='h-4 w-full' />
			</Card.Header>
		</Card.Root>
	);
}

export function BreakdownsSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6'>
			{Array.from({ length: 5 }).map((_, index) => (
				<Card.Root
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
					key={index}
					size='sm'
					className='min-w-0 md:last:col-span-2 xl:col-span-2 xl:nth-4:col-span-3 xl:last:col-span-3'
				>
					<Card.Header>
						<Skeleton className='h-4 w-24' />
					</Card.Header>
					<Card.Panel className='space-y-3'>
						<Skeleton className='h-4 w-full' />
						<Skeleton className='h-4 w-5/6' />
						<Skeleton className='h-4 w-2/3' />
					</Card.Panel>
				</Card.Root>
			))}
		</div>
	);
}

export function VisitsSkeleton() {
	return (
		<Card.Root>
			<Card.Header>
				<Skeleton className='h-5 w-32' />
			</Card.Header>
			<Card.Panel className='space-y-2'>
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-10 w-full' />
			</Card.Panel>
		</Card.Root>
	);
}

export function SettingsSkeleton() {
	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
			<Card.Root>
				<Card.Header>
					<Skeleton className='h-5 w-32' />
					<Skeleton className='h-4 w-56' />
				</Card.Header>
				<Card.Panel className='space-y-4'>
					<Skeleton className='h-9 w-full' />
					<Skeleton className='h-9 w-full' />
					<Skeleton className='h-20 w-full' />
				</Card.Panel>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Skeleton className='h-5 w-28' />
				</Card.Header>
				<Card.Panel className='space-y-4'>
					<Skeleton className='h-12 w-full' />
					<Skeleton className='h-12 w-full' />
				</Card.Panel>
			</Card.Root>
		</div>
	);
}
