import type { ComponentType, SVGProps } from 'react';

import { AccountIcon } from '../icons/account';
import { ArrowRightIcon } from '../icons/arrow-right';
import { BreuBrandIcon } from '../icons/breu';
import { CheckIcon } from '../icons/check';
import { ChevronLeftIcon } from '../icons/chevron-left';
import { ChevronRightIcon } from '../icons/chevron-right';
import { DiscordIcon } from '../icons/discord';
import { DoorOutIcon } from '../icons/door-out';
import { EllipsisVerticalIcon } from '../icons/ellipsis-vertical';
import { GitHubIcon } from '../icons/github';
import { LinkIcon } from '../icons/link';
import { PencilSparklesIcon } from '../icons/pencil-sparkle';
import { RefreshIcon } from '../icons/refresh';
import { XMarkIcon } from '../icons/x-mark';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const ICON_REGISTRY = {
	'breu-brand': BreuBrandIcon,
	discord: DiscordIcon,
	github: GitHubIcon,
	account: AccountIcon,
	check: CheckIcon,
	'chevron-left': ChevronLeftIcon,
	'chevron-right': ChevronRightIcon,
	'door-out': DoorOutIcon,
	'ellipsis-vertical': EllipsisVerticalIcon,
	link: LinkIcon,
	'pencil-sparkles': PencilSparklesIcon,
	refresh: RefreshIcon,
	'x-mark': XMarkIcon,
	'arrow-right': ArrowRightIcon,
} as const satisfies Record<string, IconComponent>;

export type IconName = keyof typeof ICON_REGISTRY;

export function isIconName(name: string): name is IconName {
	return name in ICON_REGISTRY;
}

export function resolveIconName(name: string, fallback?: string): IconName | null {
	if (isIconName(name)) return name;
	if (fallback && isIconName(fallback)) return fallback;
	return null;
}
