import z from 'zod';

/* -------------------------------------------------------------------------- */
/*  CONSTANTS & ENUMS
/* -------------------------------------------------------------------------- */

export const DEVICE_TYPE = {
	Desktop: 'desktop',
	Mobile: 'mobile',
	Tablet: 'tablet',
	Bot: 'bot',
	Unknown: 'unknown',
} as const;

/* -------------------------------------------------------------------------- */
/*  VALIDATION SCHEMAS
/* -------------------------------------------------------------------------- */

export const DeviceTypeSchema = z.enum(DEVICE_TYPE);

export const ParsedUserAgentSchema = z.object({
	browser: z.string().nullable(),
	os: z.string().nullable(),
	deviceType: DeviceTypeSchema,
});

export const VisitSchema = z.object({
	id: z.uuidv7(),
	eventId: z.uuidv7(),
	linkId: z.uuidv7(),
	userId: z.uuidv7(),
	ip: z.string().nullable(),
	country: z
		.string()
		.length(2)
		.regex(/^[A-Z]{2}$/)
		.nullable(),
	referer: z.string().nullable(),
	userAgentRaw: z.string().nullable(),
	userAgent: ParsedUserAgentSchema.nullable(),
	isBot: z.boolean(),
	visitedAt: z.iso.datetime(),
});

/* -------------------------------------------------------------------------- */
/*  TYPE DEFINITIONS
/* -------------------------------------------------------------------------- */

export type Visit = z.infer<typeof VisitSchema>;
export type VisitId = z.infer<typeof VisitSchema.shape.id>;
export type VisitLinkId = z.infer<typeof VisitSchema.shape.linkId>;
export type VisitEventId = z.infer<typeof VisitSchema.shape.eventId>;
export type ParsedUserAgent = z.infer<typeof ParsedUserAgentSchema>;
export type DeviceType = z.infer<typeof DeviceTypeSchema>;

/* -------------------------------------------------------------------------- */
/*  DTOS
/* -------------------------------------------------------------------------- */

export const CreateVisitSchema = VisitSchema;

export type CreateVisitCommand = z.infer<typeof CreateVisitSchema>;

export const RecordVisitSchema = VisitSchema.omit({
	id: true,
	userAgent: true,
	isBot: true,
}).extend({
	country: VisitSchema.shape.country.optional(),
});

export type RecordVisitCommand = z.infer<typeof RecordVisitSchema>;

/* -------------------------------------------------------------------------- */
/*  FACTORIES
/* -------------------------------------------------------------------------- */

export function createVisit(command: CreateVisitCommand): Visit {
	return VisitSchema.parse(command);
}
