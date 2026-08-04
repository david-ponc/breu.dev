import z from 'zod';

/* -------------------------------------------------------------------------- */
/*  CONSTANTS & ENUMS
/* -------------------------------------------------------------------------- */

export const LINK_STATUS = {
	Active: 'active',
	Disabled: 'disabled',
	Draft: 'draft',
} as const;

/* -------------------------------------------------------------------------- */
/*  VALIDATION SCHEMAS
/* -------------------------------------------------------------------------- */

export const LinkStatusSchema = z.enum(LINK_STATUS);

export const LinkSlugSchema = z
	.string()
	.slugify()
	.min(3)
	.max(18)
	.describe('A concise URL slug of the link');

export const LinkSchema = z.object({
	id: z.uuidv7(),
	userId: z.uuidv7(),
	slug: LinkSlugSchema,
	url: z.url(),
	status: z.enum(LINK_STATUS),
});

export const VisitorSchema = z.object({
	ip: z.string().nullable(),
	userAgent: z.string().nullable(),
	referer: z.string().nullable(),
});

/* -------------------------------------------------------------------------- */
/*  DTOS
/* -------------------------------------------------------------------------- */

export const ResolveLinkCommandSchema = z.object({
	slug: LinkSlugSchema,
	visitor: VisitorSchema,
});

/* -------------------------------------------------------------------------- */
/*  TYPE DEFINITIONS
/* -------------------------------------------------------------------------- */

export type Link = z.infer<typeof LinkSchema>;
export type LinkId = z.infer<typeof LinkSchema.shape.id>;
export type LinkSlug = z.infer<typeof LinkSchema.shape.slug>;
export type LinkStatus = z.infer<typeof LinkStatusSchema>;

export type Visitor = z.infer<typeof VisitorSchema>;
export type ResolveLinkCommand = z.infer<typeof ResolveLinkCommandSchema>;

/* -------------------------------------------------------------------------- */
/*  DOMAIN LOGIC
/* -------------------------------------------------------------------------- */

export function isResolvable(linkStatus: LinkStatus): boolean {
	return linkStatus === LINK_STATUS.Active;
}
