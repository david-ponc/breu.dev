import type { LinkStatus } from '#/contexts/brevis/links/domain/link';
import { Badge } from '#/core/ui/badge';

const statuses = {
	active: { label: 'Active', variant: 'success' },
	disabled: { label: 'Disabled', variant: 'default' },
	draft: { label: 'Draft', variant: 'warning' },
} as const;

export function StatusColumn({ status }: { status: LinkStatus }) {
	const { label, variant } = statuses[status];
	return <Badge variant={variant}>{label}</Badge>;
}
