import { BreuBrandIcon } from '#/core/icons/breu';
import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { shortLinkPath, stripHttpProtocol } from '#/core/lib/url';
import { Badge } from '#/core/ui/badge';
import { Card } from '#/core/ui/card';
import { Segmented } from '#/core/ui/segmented';
import { ActivityChart } from '#/features/links/detail/activity-chart';
import { LinkPreview } from '#/features/links/detail/preview';
import { ACTIVITY_RANGES, activityRangeLabel } from '#/features/links/detail/range';

import {
	productPreviewData as preview,
	previewMeta,
	previewPeriodClicks,
} from './product-preview-data';

const count = new Intl.NumberFormat('en-US');
const metrics = [
	{ label: 'Clicks', value: count.format(preview.lifetimeClicks) },
	{ label: 'Period', value: count.format(previewPeriodClicks) },
	{ label: 'Bots', value: count.format(preview.bots) },
	{ label: 'Last click', value: preview.lastClickLabel },
];

export function ProductPreview({ className }: { className?: string }) {
	return (
		<figure className={cn('relative min-w-0', className)}>
			<div
				aria-hidden
				className='pointer-events-none absolute inset-x-8 top-12 bottom-12 -z-10 rounded-full bg-primary/10 blur-3xl'
			/>
			<div className='rounded-2xl bg-background p-2 ring-1 ring-foreground/10'>
				<div className='flex items-center justify-between gap-4 px-3 pt-2 pb-4 sm:px-5'>
					<div className='flex items-center gap-6' aria-hidden>
						<BreuBrandIcon className='h-4 w-auto' />
						<span className='font-medium text-sm'>Links</span>
					</div>
					<span className='text-muted-foreground text-xs'>Your workspace</span>
				</div>
				<div className='space-y-5 rounded-lg bg-card p-4 ring-1 ring-foreground/10 sm:p-6'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<div className='min-w-0'>
							<div className='flex flex-wrap items-center gap-2'>
								<h2 className='font-semibold text-lg tracking-tight'>
									{shortLinkPath(preview.slug)}
								</h2>
								<Badge variant='success'>Active</Badge>
							</div>
							<p className='mt-1 flex items-center gap-2 text-muted-foreground text-sm'>
								<Icon name='arrow-right' aria-hidden className='size-3.5 shrink-0' />
								<span className='break-all'>{stripHttpProtocol(preview.url)}</span>
							</p>
						</div>
						<span
							className='flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm'
							aria-hidden
						>
							Copy link <Icon name='clipboard' className='size-3.5' />
						</span>
					</div>
					<Segmented.Root value='overview' aria-hidden>
						<Segmented.List>
							<Segmented.Item value='overview' render={<span />} decorative>
								Overview
							</Segmented.Item>
							<Segmented.Item value='visits' render={<span />} decorative>
								Recent visits
							</Segmented.Item>
							<Segmented.Item value='settings' render={<span />} decorative>
								Settings
							</Segmented.Item>
							<Segmented.Indicator />
						</Segmented.List>
					</Segmented.Root>
					<div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
						{metrics.map(({ label, value }) => (
							<Card.Root key={label} size='sm'>
								<Card.Panel>
									<dl>
										<dt className='text-muted-foreground text-sm'>{label}</dt>
										<dd className='mt-2 font-semibold text-2xl tabular-nums tracking-tight'>
											{value}
										</dd>
									</dl>
								</Card.Panel>
							</Card.Root>
						))}
					</div>
					<div className='grid min-w-0 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
						<PreviewActivity />
						<LinkPreview meta={previewMeta} />
					</div>
				</div>
			</div>
			<figcaption className='mt-5 text-center text-muted-foreground text-sm'>
				Product preview <span aria-hidden>·</span> Example data
			</figcaption>
		</figure>
	);
}

function PreviewActivity() {
	return (
		<Card.Root className='min-w-0'>
			<Card.Header className='flex flex-wrap items-start justify-between gap-3'>
				<div>
					<Card.Title>Activity</Card.Title>
					<Card.Description>Clicks over time (UTC)</Card.Description>
				</div>
				<Segmented.Root value='14d' aria-hidden>
					<Segmented.List aria-label='Activity range'>
						{ACTIVITY_RANGES.map((value) => (
							<Segmented.Item key={value} value={value} render={<span />} decorative>
								{activityRangeLabel(value)}
							</Segmented.Item>
						))}
						<Segmented.Indicator />
					</Segmented.List>
				</Segmented.Root>
			</Card.Header>
			<Card.Panel>
				<ActivityChart
					activity={preview.activity}
					interactive={false}
					ariaLabel={`Example activity: ${count.format(previewPeriodClicks)} clicks over the last 14 days.`}
				/>
			</Card.Panel>
		</Card.Root>
	);
}
