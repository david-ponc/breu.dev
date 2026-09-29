import type { LinkSummary } from '#/contexts/brevis/links/domain/link-summary';
import { stripHttpProtocol } from '#/core/lib/url';

export function SlugColumn({ link }: { link: Pick<LinkSummary, 'slug' | 'url'> }) {
	return (
		<div className='flex min-w-0 max-w-md items-center gap-1.5'>
			<svg
				width='16'
				height='16'
				viewBox='0 0 16 16'
				fill='none'
				className='shrink-0 text-muted-foreground'
			>
				<path
					d='M13.0137 1.07334C13.4276 1.0736 13.7635 1.40941 13.7637 1.82334C13.7637 2.23739 13.4277 2.57308 13.0137 2.57334H7.74902C5.40259 2.57334 3.50015 4.47597 3.5 6.82236C3.50015 9.16876 5.40259 11.0704 7.74902 11.0704H11.4375L10.3633 9.99619C10.0705 9.7034 10.0707 9.22856 10.3633 8.93564C10.6562 8.64275 11.1309 8.64275 11.4238 8.93564L13.7734 11.2853C13.7776 11.2893 13.7811 11.2938 13.7852 11.2979C13.8191 11.3328 13.8501 11.3691 13.876 11.4083C13.8896 11.429 13.8988 11.4521 13.9102 11.4737C13.9207 11.4938 13.9326 11.5132 13.9414 11.5343L13.9443 11.5392C13.9509 11.5552 13.9536 11.5725 13.959 11.589C13.9829 11.6622 13.9999 11.7392 14 11.8204C14 11.8839 13.9885 11.9451 13.9736 12.004C13.9648 12.0393 13.9555 12.0745 13.9414 12.1085C13.9399 12.1121 13.9381 12.1156 13.9365 12.1192C13.9 12.2034 13.8481 12.2829 13.7793 12.3517L11.4238 14.7071C11.1309 14.9998 10.6561 14.9999 10.3633 14.7071C10.0705 14.4143 10.0707 13.9395 10.3633 13.6466L11.4395 12.5704H7.74902C4.57417 12.5704 2.00015 9.99718 2 6.82236C2.00015 3.64754 4.57417 1.07334 7.74902 1.07334H13.0137Z'
					fill='currentColor'
				/>
			</svg>

			<div className='flex min-w-0 grow flex-col items-start gap-0'>
				<span
					title={`/${link.slug}`}
					className='min-w-0 max-w-1/2 shrink-0 truncate font-medium text-[13px] text-foreground'
				>
					/{link.slug}
				</span>
				<a
					href={link.url}
					target='_blank'
					rel='noopener noreferrer'
					title={link.url}
					className='relative z-10 min-w-0 truncate text-muted-foreground text-xs underline underline-offset-2'
				>
					{stripHttpProtocol(link.url)}
				</a>
			</div>
		</div>
	);
}
