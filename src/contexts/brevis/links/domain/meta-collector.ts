import { Service } from 'diod';

import type { Meta } from './link';

@Service()
export abstract class MetaCollector {
	abstract collect(url: string): Promise<Meta>;
}
