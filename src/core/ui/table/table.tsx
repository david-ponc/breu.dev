import { mergeProps, useRender } from '@base-ui/react';
import type { ComponentProps } from 'react';

import { cn } from '#/core/lib/cn';

function TableRoot({ className, render, ...props }: useRender.ComponentProps<'div'>) {
	const defaultProps = {
		'data-slot': 'table-root',
		className: cn(
			'min-w-0 rounded-2xl bg-muted p-0.5 text-foreground text-sm ring-1 ring-foreground/10',
			className,
		),
	};

	return useRender({
		defaultTagName: 'div',
		props: mergeProps<'div'>(defaultProps, props),
		render,
	});
}

function TableViewport({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='table-viewport'
			className={cn('min-w-0 overflow-x-auto rounded-[14px]', className)}
			{...props}
		/>
	);
}

function TableContent({ className, ...props }: ComponentProps<'table'>) {
	return (
		<table
			data-slot='table'
			className={cn('w-full border-separate border-spacing-0 text-sm', className)}
			{...props}
		/>
	);
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
	return (
		<thead
			data-slot='table-header'
			className={cn('bg-muted text-foreground', className)}
			{...props}
		/>
	);
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
	return (
		<tbody
			data-slot='table-body'
			className={cn(
				'text-card-foreground [&>tr>*]:border-border [&>tr>*]:border-b [&>tr>*]:bg-card',
				'[&>tr:first-child>*]:border-t [&>tr>:first-child]:border-l [&>tr>:last-child]:border-r',
				'[&>tr:first-child>:first-child]:rounded-tl-xl [&>tr:first-child>:last-child]:rounded-tr-xl',
				'[&>tr:last-child>:first-child]:rounded-bl-xl [&>tr:last-child>:last-child]:rounded-br-xl',
				className,
			)}
			{...props}
		/>
	);
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
	return <tr data-slot='table-row' className={cn(className)} {...props} />;
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
	return (
		<th
			data-slot='table-head'
			scope='col'
			className={cn('px-3 py-2 text-start align-middle font-medium', className)}
			{...props}
		/>
	);
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
	return (
		<td data-slot='table-cell' className={cn('px-1.5 py-1', className)} {...props} />
	);
}

function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
	return (
		<caption
			data-slot='table-caption'
			className={cn('px-1.5 py-1 text-start text-muted-foreground', className)}
			{...props}
		/>
	);
}

function TableFooter({ className, ...props }: ComponentProps<'footer'>) {
	return (
		<footer
			data-slot='table-footer'
			className={cn(
				'flex flex-wrap items-center justify-between gap-2 rounded-b-[14px] bg-muted px-3 py-2',
				className,
			)}
			{...props}
		/>
	);
}

export const Table = {
	Body: TableBody,
	Caption: TableCaption,
	Cell: TableCell,
	Content: TableContent,
	Footer: TableFooter,
	Head: TableHead,
	Header: TableHeader,
	Root: TableRoot,
	Row: TableRow,
	Viewport: TableViewport,
};
