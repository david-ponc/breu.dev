import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';
import { Icon } from '#/core/icons/icon';
import { stripHttpProtocol } from '#/core/lib/url';

export function SlugColumn({ link }: { link: Pick<LinkSummary, 'slug' | 'url'> }) {
	return (
		<div className='flex min-w-0 max-w-md items-center gap-2'>
			<a
				href={`/api/redirect/links/${encodeURIComponent(link.slug)}`}
				target='_blank'
				rel='noopener noreferrer'
				title={`/${link.slug}`}
				className='min-w-0 max-w-1/2 shrink-0 truncate rounded-sm font-medium text-foreground underline decoration-dotted underline-offset-2'
			>
				/{link.slug}
			</a>
			<Icon name='arrow-right' className='text-muted-foreground' />
			<a
				href={link.url}
				target='_blank'
				rel='noopener noreferrer'
				title={link.url}
				className='min-w-0 truncate rounded-sm text-muted-foreground underline decoration-dotted underline-offset-2'
			>
				{stripHttpProtocol(link.url)}
			</a>
		</div>
	);
}
