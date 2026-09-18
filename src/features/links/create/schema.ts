import type z from 'zod';

import { LinkSchema } from '#/contexts/brevis/links/domain/link.ts';

export const CreateLinkValuesSchema = LinkSchema.pick({
	slug: true,
	url: true,
	comments: true,
	meta: true,
});

export type CreateLinkValues = z.infer<typeof CreateLinkValuesSchema>;
