import {
	getCoreRowModel,
	type OnChangeFn,
	type RowSelectionState,
	useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';

import { columns } from './columns';

const EMPTY_LINKS: LinkSummary[] = [];

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

	const table = useReactTable({
		data: links,
		state: { rowSelection },
		enableRowSelection: true,
		onRowSelectionChange: handleRowSelectionChange,
		columns,
		getRowId: (link) => link.id,
		getCoreRowModel: getCoreRowModel(),
	});

	useEffect(() => {
		const selected = links.filter((link) => rowSelection[link.id]);
		onSelectionChange?.(selected);
	}, [links, rowSelection]);

	return table;
}
