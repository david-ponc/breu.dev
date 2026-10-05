import {
	createPaginatedRowModel,
	rowPaginationFeature,
	rowSelectionFeature,
	tableFeatures,
} from '@tanstack/react-table';

export const linkTableFeatures = tableFeatures({
	rowSelectionFeature,
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
});
