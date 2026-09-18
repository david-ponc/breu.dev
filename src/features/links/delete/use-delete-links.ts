import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';
import { httpClient } from '#/core/lib/http/client';
import { toastManager } from '#/core/ui/toast';
import { userLinksQueryKey } from '#/features/links/table/query';

export function useDeleteLinks({ handle, userId, onDeleted }: UseDeleteLinksOptions) {
	const queryClient = useQueryClient();
	const { isPending, mutate } = useMutation({
		mutationFn: deleteLinks,
		onSuccess: ({ deleted }) => {
			if (deleted === 0) return;
			handle.close();
			onDeleted();
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: userLinksQueryKey(userId) });
		},
	});

	return { isPending, deleteLinks: mutate };
}

interface UseDeleteLinksOptions {
	handle: { close: () => void };
	userId: string;
	onDeleted: () => void;
}

interface FailedDelete {
	slug: string;
	message: string;
}

interface DeleteLinksResult {
	deleted: number;
	failed: FailedDelete[];
}

async function deleteLinks(links: LinkSummary[]): Promise<DeleteLinksResult> {
	const toastId = toastManager.add(loadingToast(links));
	const results = await Promise.allSettled(links.map(deleteLink));
	const failed = results.flatMap((result, index) =>
		result.status === 'rejected'
			? [{ slug: links[index].slug, message: errorMessage(result.reason) }]
			: [],
	);
	const deleted = links.length - failed.length;
	toastManager.update(toastId, completionToast(links, deleted, failed));
	return { deleted, failed };
}

async function deleteLink(link: LinkSummary) {
	const { error } = await httpClient().brevis.links({ id: link.id }).delete();
	if (error) throw error;
}

function loadingToast(links: LinkSummary[]) {
	const isSingle = links.length === 1;
	return {
		type: 'loading' as const,
		title: isSingle ? 'Deleting link...' : 'Deleting links...',
		description: isSingle
			? `Removing /${links[0].slug}`
			: `Removing ${links.length} links`,
		timeout: 0,
	};
}

function completionToast(links: LinkSummary[], deleted: number, failed: FailedDelete[]) {
	const total = links.length;
	const isSingle = total === 1;

	if (failed.length === 0) {
		return {
			type: 'success' as const,
			title: isSingle ? 'Link deleted' : 'Links deleted',
			description: isSingle
				? `/${links[0].slug} has been removed.`
				: `${total} links have been removed.`,
		};
	}

	if (failed.length === total) {
		return {
			type: 'error' as const,
			title: isSingle ? 'Failed to delete link' : 'Failed to delete links',
			description: isSingle
				? `/${failed[0].slug} could not be deleted. ${failed[0].message}`
				: `None of the selected links could be deleted: ${failedSlugs(failed)}.`,
		};
	}

	return {
		type: 'error' as const,
		title: 'Some links could not be deleted',
		description: `${deleted} of ${total} deleted. The following could not be deleted: ${failedSlugs(failed)}.`,
	};
}

function failedSlugs(failed: FailedDelete[]) {
	return failed.map((item) => `/${item.slug}`).join(', ');
}

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Unexpected error';
}
