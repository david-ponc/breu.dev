import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { Button } from '#/core/ui/button';

export interface PaginationProps {
	pageIndex: number;
	pageCount: number;
	canPreviousPage: boolean;
	canNextPage: boolean;
	onPreviousPage?: () => void;
	onNextPage?: () => void;
	className?: string;
}

export function Pagination({
	pageIndex,
	pageCount,
	canPreviousPage,
	canNextPage,
	onPreviousPage,
	onNextPage,
	className,
}: PaginationProps) {
	return (
		<nav aria-label='Pagination' className={cn('flex items-center gap-0.5', className)}>
			<Button
				variant='outline'
				size='icon-sm'
				aria-label='Previous page'
				disabled={!canPreviousPage}
				onClick={onPreviousPage}
			>
				<Icon name='chevron-left' />
			</Button>
			<span className='min-w-20 px-2 text-center tabular-nums'>
				Page {pageIndex + 1} of {pageCount}
			</span>
			<Button
				variant='outline'
				size='icon-sm'
				aria-label='Next page'
				disabled={!canNextPage}
				onClick={onNextPage}
			>
				<Icon name='chevron-right' />
			</Button>
		</nav>
	);
}
