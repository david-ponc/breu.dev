import { Service } from 'diod';

import type { LinkSlug, Meta } from './link';

export type SlugGeneratorContext = {
	meta?: Meta;
	rejected?: readonly LinkSlug[];
};

@Service()
export abstract class SlugGenerator {
	abstract generate(context?: SlugGeneratorContext): Promise<LinkSlug>;
}
