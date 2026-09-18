import z from 'zod';

import { LinkSchema } from './link';

export const LinkActivitySchema = z.object({
	date: z.iso.date(),
	clicks: z.number().int().nonnegative(),
});

export const LinkSummarySchema = LinkSchema.pick({
	id: true,
	slug: true,
	url: true,
	status: true,
	createdAt: true,
}).extend({
	totalClicks: z.number().int().nonnegative(),
	activity: z.array(LinkActivitySchema),
});

export type LinkActivity = z.infer<typeof LinkActivitySchema>;
export type LinkSummary = z.infer<typeof LinkSummarySchema>;
