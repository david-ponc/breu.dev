import { gateway, generateText, Output } from 'ai';
import { Service } from 'diod';
import z from 'zod';

import { serverEnv } from '#/config/env';
import { SlugSuggestionFailedError } from '#/contexts/brevis/links/domain/errors/slug-suggestion-failed';
import {
	type LinkSlug,
	LinkSlugSchema,
	type Meta,
} from '#/contexts/brevis/links/domain/link';
import type {
	SlugGenerator,
	SlugGeneratorContext,
} from '#/contexts/brevis/links/domain/slug-generator';
import { logger } from '#/core/lib/logging';

const OutputSchema = z.object({
	slug: LinkSlugSchema.describe('A concise URL slug between 3 and 18 characters'),
});

function buildPrompt(meta: Meta, rejected: readonly LinkSlug[]): string {
	const rejectedBlock =
		rejected.length > 0
			? `\nDo not use any of these already taken slugs: ${rejected.join(', ')}.`
			: '';

	return [
		'Generate a short, memorable URL slug for a link bookmark.',
		'Rules:',
		'- kebab-case only (lowercase letters, digits, hyphens)',
		'- between 3 and 18 characters inclusive',
		'- prefer 2 short words when possible',
		'- no leading/trailing hyphens',
		'- based on the page metadata below',
		rejectedBlock,
		'',
		'Metadata:',
		`- title: ${meta.title ?? '(none)'}`,
		`- description: ${meta.description ?? '(none)'}`,
		`- openGraph.title: ${meta.openGraph?.title ?? '(none)'}`,
		`- openGraph.description: ${meta.openGraph?.description ?? '(none)'}`,
		`- author: ${meta.author ?? '(none)'}`,
	].join('\n');
}

@Service()
export class GatewayAiSlugGenerator implements SlugGenerator {
	async generate(context: SlugGeneratorContext = {}): Promise<LinkSlug> {
		if (!context.meta) {
			throw new SlugSuggestionFailedError();
		}

		const rejected = context.rejected ?? [];

		logger.debug({ rejectedCount: rejected.length }, 'Generating slug with AI');

		try {
			const { output } = await generateText({
				model: gateway(serverEnv.AI_SLUG_MODEL),
				output: Output.object({
					schema: OutputSchema,
					name: 'LinkSlug',
					description: 'A concise URL slug for a bookmark link',
				}),
				prompt: buildPrompt(context.meta, rejected),
				temperature: 0.7,
			});

			if (!output) {
				throw new SlugSuggestionFailedError();
			}

			return output.slug;
		} catch (cause) {
			if (cause instanceof SlugSuggestionFailedError) {
				throw cause;
			}

			logger.error({ err: cause }, 'AI slug generation failed');
			throw new SlugSuggestionFailedError();
		}
	}
}
