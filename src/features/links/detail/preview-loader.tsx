import { useSuspenseQuery } from '@tanstack/react-query';

import { LinkPreview } from './preview';
import { userLinkQueryOptions } from './query';

interface LinkDetailPreviewProps {
	linkId: string;
	userId: string;
}

export function LinkDetailPreview({ linkId, userId }: LinkDetailPreviewProps) {
	const { data: link } = useSuspenseQuery(userLinkQueryOptions(userId, linkId));

	return <LinkPreview meta={link.meta} comments={link.comments} />;
}
