import type { ComponentType, SVGProps } from 'react';

import { AccountIcon } from '../icons/account';
import { ArrowRightIcon } from '../icons/arrow-right';
import { BreuBrandIcon } from '../icons/breu';
import { CheckIcon } from '../icons/check';
import { ChevronLeftIcon } from '../icons/chevron-left';
import { ChevronRightIcon } from '../icons/chevron-right';
import { ClipboardIcon } from '../icons/clipboard';
import { CursorClickIcon } from '../icons/cursor-click';
import { DeviceDesktopIcon } from '../icons/device-desktop';
import { DeviceMobileIcon } from '../icons/device-mobile';
import { DeviceTabletIcon } from '../icons/device-tablet';
import { DeviceUnknownIcon } from '../icons/device-unknown';
import { DiscordIcon } from '../icons/discord';
import { DoorOutIcon } from '../icons/door-out';
import { EllipsisVerticalIcon } from '../icons/ellipsis-vertical';
import { GitHubIcon } from '../icons/github';
import { LinkIcon } from '../icons/link';
import { OsAndroidIcon } from '../icons/os-android';
import { OsAppleIcon } from '../icons/os-apple';
import { OsLinuxIcon } from '../icons/os-linux';
import { OsUnknownIcon } from '../icons/os-unknown';
import { OsWindowsIcon } from '../icons/os-windows';
import { PencilSparklesIcon } from '../icons/pencil-sparkle';
import { RefreshIcon } from '../icons/refresh';
import { RobotIcon } from '../icons/robot';
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
	clipboard: ClipboardIcon,
	'cursor-click': CursorClickIcon,
	'device-desktop': DeviceDesktopIcon,
	'device-mobile': DeviceMobileIcon,
	'device-tablet': DeviceTabletIcon,
	'device-unknown': DeviceUnknownIcon,
	'door-out': DoorOutIcon,
	'ellipsis-vertical': EllipsisVerticalIcon,
	link: LinkIcon,
	'os-android': OsAndroidIcon,
	'os-apple': OsAppleIcon,
	'os-linux': OsLinuxIcon,
	'os-unknown': OsUnknownIcon,
	'os-windows': OsWindowsIcon,
	'pencil-sparkles': PencilSparklesIcon,
	refresh: RefreshIcon,
	robot: RobotIcon,
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
