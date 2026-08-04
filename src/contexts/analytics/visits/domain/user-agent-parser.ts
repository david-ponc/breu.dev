import { Service } from 'diod';

import type { Maybe } from '#/core/types';

import type { ParsedUserAgent } from './visit';

export type UserAgentParseResult = {
	userAgent: ParsedUserAgent;
	isBot: boolean;
};

@Service()
export abstract class UserAgentParser {
	abstract parse(raw: Maybe<string>): Maybe<UserAgentParseResult>;
}
