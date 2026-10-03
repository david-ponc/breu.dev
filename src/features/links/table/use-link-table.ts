import {
	getCoreRowModel,
	getPaginationRowModel,
	type OnChangeFn,
	type PaginationState,
	type RowSelectionState,
	useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';

import { columns } from './columns';

const EMPTY_LINKS: LinkSummary[] = [];

export const LINKS_PAGE_SIZE = 10;

interface UseLinkTableOptions {
	links?: LinkSummary[];
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: (selection: RowSelectionState) => void;
	onSelectionChange?: (selectedLinks: LinkSummary[]) => void;
}

export function useLinkTable({
	links = EMPTY_LINKS,
	rowSelection: rowSelectionProp,
	onRowSelectionChange,
	onSelectionChange,
}: UseLinkTableOptions) {
	const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
	const isControlled = rowSelectionProp !== undefined;
	const rowSelection = isControlled ? rowSelectionProp : internalRowSelection;

	const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
		const next = typeof updater === 'function' ? updater(rowSelection) : updater;
		if (!isControlled) setInternalRowSelection(next);
		onRowSelectionChange?.(next);
	};

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: LINKS_PAGE_SIZE,
	});
	const pageCount = Math.max(1, Math.ceil(links.length / pagination.pageSize));
	const pageIndex = Math.min(pagination.pageIndex, pageCount - 1);

	useEffect(() => {
		if (pagination.pageIndex > pageCount - 1) {
			setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }));
		}
	}, [pageCount, pagination.pageIndex]);

	const table = useReactTable({
		data: links,
		state: { rowSelection, pagination: { ...pagination, pageIndex } },
		enableRowSelection: true,
		onRowSelectionChange: handleRowSelectionChange,
		onPaginationChange: setPagination,
		autoResetPageIndex: false,
		columns,
		getRowId: (link) => link.id,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	useEffect(() => {
		const selected = links.filter((link) => rowSelection[link.id]);
		onSelectionChange?.(selected);
	}, [links, rowSelection]);

	return table;
}
