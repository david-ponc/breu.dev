import z from 'zod';

import { LinkCreatedEvent } from './events/link-created-event';
import { LinkUpdatedEvent } from './events/link-updated-event';

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

export const OpenGraphSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
	image: z.url().nullable(),
});

export const MetaSchema = z.object({
	author: z.string().nullable(),
	favicon: z.url().nullable(),
	title: z.string().nullable(),
	description: z.string().nullable(),
	openGraph: OpenGraphSchema.nullable(),
});

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
	comments: z.string().nullable(),
	meta: MetaSchema.nullable(),
	status: z.enum(LINK_STATUS),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

/* -------------------------------------------------------------------------- */
/*  TYPE DEFINITIONS
/* -------------------------------------------------------------------------- */

export type Link = z.infer<typeof LinkSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type OpenGraph = z.infer<typeof OpenGraphSchema>;
export type LinkId = z.infer<typeof LinkSchema.shape.id>;
export type LinkStatus = z.infer<typeof LinkStatusSchema>;
export type LinkSlug = z.infer<typeof LinkSchema.shape.slug>;

/* -------------------------------------------------------------------------- */
/*  DTOS
/* -------------------------------------------------------------------------- */

export const CreateLinkSchema = LinkSchema.omit({
	status: true,
	createdAt: true,
	updatedAt: true,
});

export const DeleteLinkSchema = LinkSchema.pick({
	id: true,
	userId: true,
});

export type CreateLinkCommand = z.infer<typeof CreateLinkSchema>;
export type DeleteLinkCommand = z.infer<typeof DeleteLinkSchema>;

export const UpdateLinkSchema = LinkSchema.partial().omit({
	id: true,
	userId: true,
	createdAt: true,
});

export type UpdateLinkCommand = z.infer<typeof UpdateLinkSchema>;

/* -------------------------------------------------------------------------- */
/*  FACTORIES
/* -------------------------------------------------------------------------- */

export function createLink(command: CreateLinkCommand): [Link, LinkCreatedEvent] {
	const now = new Date().toISOString();
	const link = LinkSchema.parse({
		...command,
		createdAt: now,
		updatedAt: now,
		status: LINK_STATUS.Active,
	});
	const event = new LinkCreatedEvent(link);

	return [link, event];
}

export function updateLink(
	existing: Link,
	command: UpdateLinkCommand,
): [Link, LinkUpdatedEvent] {
	const now = new Date().toISOString();
	const link = LinkSchema.parse({
		...existing,
		...command,
		updatedAt: now,
	});
	const event = new LinkUpdatedEvent(link);

	return [link, event];
}
