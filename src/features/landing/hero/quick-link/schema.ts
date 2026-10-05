import type z from 'zod';

import { LinkSchema } from '#/contexts/brevis/links/domain/link.ts';

export const QuickLinkValuesSchema = LinkSchema.pick({ url: true });

export type QuickLinkValues = z.infer<typeof QuickLinkValuesSchema>;
