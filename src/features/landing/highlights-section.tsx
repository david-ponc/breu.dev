import { use } from 'react';
import { browser } from 'react-dom';

import type { NamedCount } from '#/contexts/analytics/visits/domain/link-stats';
import { Icon } from '#/core/icons/icon';
import { Badge } from '#/core/ui/badge';
import { Card } from '#/core/ui/card';
import { ActivityChart } from '#/features/links/detail/activity-chart';
import { BreakdownChart, CountryFlag } from '#/features/links/detail/breakdown-chart';
import { formatCountry } from '#/features/links/detail/format';

import { highlightsActivity, highlightsPeriodClicks } from './hero/product-preview-data';

const previewCountries = [
	{ key: 'MX', count: 420 },
	{ key: 'ES', count: 310 },
	{ key: 'AR', count: 216 },
	{ key: 'IE', count: 180 },
] satisfies NamedCount[];

const previewLinks = [
	{
		shortUrl: 'breu.dev/r/launch-notes',
		destination: 'example.com/launch',
		clicks: '2,847',
	},
	{
		shortUrl: 'breu.dev/r/early-access',
		destination: 'example.com/early-access',
		clicks: '1,294',
	},
	{
		shortUrl: 'breu.dev/r/product-update',
		destination: 'example.com/product/update',
		clicks: '968',
	},
];

export function HighlightsSection() {
	return (
		<section
			aria-labelledby='highlights-title'
			className='relative z-10 border-border border-t bg-card'
		>
			<div className='mx-auto max-w-7xl px-6 pt-14 sm:pt-18 lg:px-12'>
				<div className='grid gap-4 pb-8 sm:gap-6 md:grid-cols-2 md:items-end md:pb-10'>
					<div>
						<p className='reveal-from-left flex items-center gap-2 font-medium'>
							<Icon name='presentation-chart' aria-hidden className='size-4 shrink-0' />
							Links &amp; analytics
						</p>
						<h2
							id='highlights-title'
							className='reveal-from-left mt-1.5 text-balance font-semibold text-3xl tracking-tight sm:text-4xl'
						>
							More than a shorter URL.
						</h2>
					</div>
					<p className='reveal-from-right max-w-xl text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg md:justify-self-end'>
						Keep your links organized, then see how people reach them.
					</p>
				</div>

				<div className='grid grid-cols-1 divide-y divide-border border-border border-t md:grid-cols-3 md:divide-x md:divide-y-0'>
					<article className='min-w-0 py-6 md:px-5 md:py-7 md:last:pr-0 md:first:pl-0 lg:py-8'>
						<LinkVisual />
						<h3 className='mt-6 font-medium text-lg tracking-tight'>
							Links, kept in order
						</h3>
						<p className='mt-2 max-w-sm text-pretty text-muted-foreground leading-relaxed'>
							Manage each short link, its destination, status, and internal notes from one
							workspace.
						</p>
					</article>

					<article className='min-w-0 py-6 md:px-5 md:py-7 lg:py-8'>
						<ActivityVisual />
						<h3 className='mt-6 font-medium text-lg tracking-tight'>
							Clicks, made clear
						</h3>
						<p className='mt-2 max-w-sm text-pretty text-muted-foreground leading-relaxed'>
							Follow activity over time and see click totals, bot traffic, and your latest
							clicks.
						</p>
					</article>

					<article className='min-w-0 py-6 md:py-7 md:pr-0 md:pl-5 lg:py-8'>
						<TrafficVisual />
						<h3 className='mt-6 font-medium text-lg tracking-tight'>
							Know where visits come from
						</h3>
						<p className='mt-2 max-w-sm text-pretty text-muted-foreground leading-relaxed'>
							See where visits come from, with useful breakdowns by country, referrer, and
							device.
						</p>
					</article>
				</div>
			</div>
		</section>
	);
}

function LinkVisual() {
	return (
		<div aria-hidden className='grid h-64 w-full place-items-center'>
			{previewLinks.map((link, index) => (
				<Card.Root
					key={link.shortUrl}
					className='col-start-1 row-start-1 mx-auto w-full max-w-sm origin-bottom gap-3 bg-card-opaque shadow-md'
					style={{
						transform: `translateY(calc(${index * -12}px - ${index * 10}%)) scale(${1 - index * 0.1})`,
						zIndex: previewLinks.length - index,
					}}
				>
					<Card.Panel className='space-y-3'>
						<div className='flex items-center justify-between gap-3'>
							<div className='min-w-0'>
								<p className='truncate font-medium font-mono text-sm'>{link.shortUrl}</p>
								<p className='mt-1 truncate text-muted-foreground text-xs'>
									{link.destination}
								</p>
							</div>
							<Badge variant='success'>Active</Badge>
						</div>
						<div className='flex items-center justify-between border-border border-t pt-3 text-xs'>
							<span className='text-muted-foreground'>Clicks</span>
							<span className='font-medium tabular-nums'>{link.clicks}</span>
						</div>
					</Card.Panel>
				</Card.Root>
			))}
		</div>
	);
}

function ActivityVisual() {
	use(browser());
	return (
		<div aria-hidden inert className='flex h-64 items-center'>
			<ActivityChart
				activity={highlightsActivity}
				interactive={false}
				height={215}
				ariaLabel={`Example activity: ${highlightsPeriodClicks} clicks over the last 14 days.`}
			/>
		</div>
	);
}

function TrafficVisual() {
	use(browser());
	return (
		<div aria-hidden inert className='flex h-64 items-center'>
			<Card.Root size='sm' className='mx-auto w-full max-w-sm'>
				<Card.Header>
					<Card.Title>Countries</Card.Title>
				</Card.Header>
				<Card.Panel>
					<BreakdownChart
						title='Countries'
						items={previewCountries}
						formatKey={formatCountry}
						leading={CountryFlag}
					/>
				</Card.Panel>
			</Card.Root>
		</div>
	);
}
