import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			'inset-shadow': ['t-px'],
		},
	},
});

export function cn(...classes: ClassValue[]) {
	return twMerge(clsx(...classes));
}
