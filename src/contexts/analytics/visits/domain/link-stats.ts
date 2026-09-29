import z from 'zod';

import { ParsedUserAgentSchema, VisitSchema } from './visit';

export const LinkActivitySchema = z.object({
	date: z.iso.date(),
	clicks: z.number().int().nonnegative(),
});

export const NamedCountSchema = z.object({
	key: z.string(),
	count: z.number().int().nonnegative(),
});

export const LinkStatsSchema = z.object({
	lifetimeClicks: z.number().int().nonnegative(),
	periodClicks: z.number().int().nonnegative(),
	bots: z.number().int().nonnegative(),
	lastVisitedAt: z.iso.datetime().nullable(),
	activity: z.array(LinkActivitySchema),
	devices: z.array(NamedCountSchema),
	browsers: z.array(NamedCountSchema),
	os: z.array(NamedCountSchema),
	referrers: z.array(NamedCountSchema),
	countries: z.array(NamedCountSchema),
});

export const VisitLogEntrySchema = VisitSchema.pick({
	id: true,
	visitedAt: true,
	referer: true,
	country: true,
	isBot: true,
}).extend({
	userAgent: ParsedUserAgentSchema.nullable(),
});

export const SearchLinkStatsSchema = z.object({
	linkId: VisitSchema.shape.linkId,
	userId: VisitSchema.shape.userId,
	since: z.iso.datetime(),
	until: z.iso.datetime(),
});

export const SearchRecentVisitsSchema = z.object({
	linkId: VisitSchema.shape.linkId,
	userId: VisitSchema.shape.userId,
	limit: z.number().int().min(1).max(100),
});

export type LinkActivity = z.infer<typeof LinkActivitySchema>;
export type NamedCount = z.infer<typeof NamedCountSchema>;
export type LinkStats = z.infer<typeof LinkStatsSchema>;
export type VisitLogEntry = z.infer<typeof VisitLogEntrySchema>;
export type SearchLinkStatsQuery = z.infer<typeof SearchLinkStatsSchema>;
export type SearchRecentVisitsQuery = z.infer<typeof SearchRecentVisitsSchema>;
