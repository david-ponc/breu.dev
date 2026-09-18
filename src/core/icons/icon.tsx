import type { SVGProps } from 'react';

import { ICON_REGISTRY, type IconName, resolveIconName } from '#/core/lib/icon-registry';

interface Props extends SVGProps<SVGSVGElement> {
	name: IconName | (string & {});
	fallback?: string;
}

export function Icon({ name, fallback, ...props }: Props) {
	const resolvedName = resolveIconName(name, fallback);

	if (!resolvedName) {
		return null;
	}

	const IconRegistry = ICON_REGISTRY[resolvedName];

	return <IconRegistry {...props} />;
}
