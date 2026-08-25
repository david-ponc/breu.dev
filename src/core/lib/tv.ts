import { createTV } from 'tailwind-variants';

export type { VariantProps } from 'tailwind-variants';

export const tv = createTV({
	twMerge: true,
	twMergeConfig: {
		/* Reference: https://github.com/dcastil/tailwind-merge/issues/595 */
		extend: {
			theme: {
				'inset-shadow': ['t-px'],
			},
		},
	},
});
