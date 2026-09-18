import type { ColumnDef } from '@tanstack/react-table';

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

export const columns: ColumnDef<LinkSummary>[] = [
	{
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
	},
	{
		accessorKey: 'slug',
		header: 'Link',
		cell: ({ row }) => <SlugColumn link={row.original} />,
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => <StatusColumn status={row.original.status} />,
	},
	{
		accessorKey: 'totalClicks',
		header: 'Activity',
		cell: ({ row }) => <ActivityColumn activity={row.original.activity} />,
	},
	{
		accessorKey: 'createdAt',
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
	},
];
