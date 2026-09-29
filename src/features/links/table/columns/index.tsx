import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';

import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';
import { Checkbox } from '#/core/ui/checkbox';

import { ActivityColumn } from './activity-column';
import { SlugColumn } from './slug-column';
import { StatusColumn } from './status-column';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC',
});

const columnHelper = createColumnHelper<LinkSummary>();

export const columns = [
	columnHelper.display({
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				className='hit-area-3'
				aria-label='Select all links'
				checked={table.getIsAllRowsSelected()}
				indeterminate={table.getIsSomeRowsSelected()}
				disabled={table.getRowModel().rows.length === 0}
				onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				className='hit-area-3'
				aria-label={`Select /${row.original.slug}`}
				checked={row.getIsSelected()}
				onCheckedChange={(checked) => row.toggleSelected(checked)}
			/>
		),
		enableSorting: false,
		enableHiding: false,
	}),
	columnHelper.accessor('slug', {
		header: 'Link',
		cell: ({ row }) => (
			<>
				<SlugColumn link={row.original} />
				<Link
					to='/dashboard/links/$linkId'
					params={{ linkId: row.original.id }}
					aria-label={`Open details for /${row.original.slug}`}
					className='absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
				/>
			</>
		),
	}),
	columnHelper.accessor('status', {
		header: 'Status',
		cell: ({ row }) => <StatusColumn status={row.original.status} />,
	}),
	columnHelper.accessor('totalClicks', {
		header: 'Activity',
		cell: ({ row }) => (
			<ActivityColumn
				activity={row.original.activity}
				totalClicks={row.getValue('totalClicks')}
			/>
		),
	}),
	columnHelper.accessor('createdAt', {
		header: 'Created',
		cell: ({ row }) => (
			<time
				dateTime={row.original.createdAt}
				title={`${row.original.createdAt} (UTC)`}
				className='whitespace-nowrap text-muted-foreground'
			>
				{dateFormatter.format(new Date(row.original.createdAt))}
			</time>
		),
	}),
];
