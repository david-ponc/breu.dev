import { useQuery } from '@tanstack/react-query';
import { flexRender, type RowSelectionState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';
import { AlertIcon } from '#/core/icons/alert';
import { Icon } from '#/core/icons/icon';
import { LinkIcon } from '#/core/icons/link';
import { RefreshIcon } from '#/core/icons/refresh';
import { Button } from '#/core/ui/button';
import { Checkbox } from '#/core/ui/checkbox';
import { Empty } from '#/core/ui/empty';
import { GridPattern } from '#/core/ui/patterns/grid-pattern';
import { Skeleton } from '#/core/ui/skeleton';
import { Table } from '#/core/ui/table';

import { userLinksQueryOptions } from './query';
import { useLinkTable } from './use-link-table';

const SKELETON_ROWS = 10;

function LinkTableSkeleton() {
	return (
		<Table.Root aria-busy role='status'>
			<Table.Viewport>
				<Table.Content aria-label='Your links' className='min-w-180'>
					<Table.Header>
						<Table.Row>
							<Table.Head className='h-10 w-10 min-w-10 max-w-10 p-0 text-center leading-0'>
								<Checkbox aria-label='Select all links' className='hit-area-3' disabled />
							</Table.Head>
							<Table.Head>Link</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Activity</Table.Head>
							<Table.Head>Created</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are static placeholders
							<Table.Row key={`skeleton-row-${rowIndex}`}>
								<Table.Cell className='size-10 min-w-10 max-w-10 p-0 text-center leading-0'>
									<Checkbox aria-label='Select link' className='hit-area-3' disabled />
								</Table.Cell>
								<Table.Cell>
									<div className='flex min-w-0 max-w-md items-center gap-2'>
										<Skeleton className='h-4 w-20 shrink-0' />
										<Icon name='arrow-right' className='text-muted-foreground' />
										<Skeleton className='h-4 w-32' />
									</div>
								</Table.Cell>
								<Table.Cell>
									<Skeleton className='h-5 w-16 rounded-md' />
								</Table.Cell>
								<Table.Cell>
									<Skeleton className='h-8 w-40 shrink-0 rounded-sm' />
								</Table.Cell>
								<Table.Cell>
									<Skeleton className='h-4 w-20' />
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Content>
			</Table.Viewport>
			<Table.Footer className='text-muted-foreground text-xs'>
				<span>Loading…</span>
				<span>Total clicks · activity over the last 14 days (UTC)</span>
			</Table.Footer>
		</Table.Root>
	);
}

function LinkTableEmpty({ firstResult }: { firstResult: boolean }) {
	const [animateIcon] = useState(firstResult);
	return (
		<Empty.Root className='relative'>
			<GridPattern />
			<Empty.Media
				variant='icon'
				className={animateIcon ? 'empty-link-icon-enter' : undefined}
			>
				<LinkIcon />
			</Empty.Media>
			<Empty.Header className='z-1'>
				<Empty.Title>No links yet</Empty.Title>
				<Empty.Description>
					Create your first link to start tracking clicks.
				</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	);
}

function LinkTableError({
	onRetry,
	isRetrying,
}: {
	onRetry: () => void;
	isRetrying: boolean;
}) {
	return (
		<Empty.Root role='alert'>
			<Empty.Media variant='icon'>
				<AlertIcon />
			</Empty.Media>
			<Empty.Header>
				<Empty.Title>Unable to load your links</Empty.Title>
				<Empty.Description>
					Something went wrong while loading your links. Please try again.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button variant='outline' onClick={onRetry} disabled={isRetrying}>
					<RefreshIcon />
					Try again
				</Button>
			</Empty.Content>
		</Empty.Root>
	);
}

export interface LinkTableProps {
	userId: string;
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: (selection: RowSelectionState) => void;
	onSelectionChange?: (selectedLinks: LinkSummary[]) => void;
}

export function LinkTable({
	userId,
	rowSelection,
	onRowSelectionChange,
	onSelectionChange,
}: LinkTableProps) {
	const query = useQuery(userLinksQueryOptions(userId));
	const table = useLinkTable({
		links: query.data,
		rowSelection,
		onRowSelectionChange,
		onSelectionChange,
	});
	const rows = table.getRowModel().rows;
	const [hasResolved, setHasResolved] = useState(false);
	useEffect(() => {
		if (!query.isPending) setHasResolved(true);
	}, [query.isPending]);

	if (query.isPending) {
		return <LinkTableSkeleton />;
	}

	if (query.isError) {
		return (
			<LinkTableError
				onRetry={() => void query.refetch()}
				isRetrying={query.isFetching}
			/>
		);
	}

	if (rows.length === 0) {
		return <LinkTableEmpty firstResult={!hasResolved} />;
	}

	return (
		<Table.Root aria-busy={query.isFetching}>
			<Table.Viewport>
				<Table.Content aria-label='Your links' className='min-w-[720px]'>
					<Table.Header>
						{table.getHeaderGroups().map((group) => (
							<Table.Row key={group.id}>
								{group.headers.map((header) => (
									<Table.Head
										key={header.id}
										colSpan={header.colSpan}
										className={
											header.column.id === 'select'
												? 'h-10 w-10 min-w-10 max-w-10 p-0 text-center leading-0'
												: undefined
										}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</Table.Head>
								))}
							</Table.Row>
						))}
					</Table.Header>
					<Table.Body>
						{rows.map((row) => (
							<Table.Row key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<Table.Cell
										key={cell.id}
										className={
											cell.column.id === 'select'
												? 'size-10 min-w-10 max-w-10 p-0 text-center leading-0'
												: undefined
										}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</Table.Cell>
								))}
							</Table.Row>
						))}
					</Table.Body>
				</Table.Content>
			</Table.Viewport>
			<Table.Footer className='text-muted-foreground text-xs'>
				<span>
					{rows.length} {rows.length === 1 ? 'link' : 'links'}
				</span>
				<span>Total clicks · activity over the last 14 days (UTC)</span>
			</Table.Footer>
		</Table.Root>
	);
}
