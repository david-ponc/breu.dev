import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { Badge } from '#/core/ui/badge';
import { Card } from '#/core/ui/card';
import { Table } from '#/core/ui/table';
import {
	browserAgent,
	deviceAgent,
	originAgent,
	osAgent,
	referrerAgent,
} from '#/features/links/detail/visit-agent';

const recentVisits = [
	{
		id: 'visit-1',
		time: '2 min ago',
		referrer: referrerAgent('Google'),
		device: deviceAgent('desktop'),
		browser: browserAgent('Chrome'),
		os: osAgent('macOS'),
		origin: originAgent(false),
	},
	{
		id: 'visit-2',
		time: '8 min ago',
		referrer: referrerAgent('Direct'),
		device: deviceAgent('mobile'),
		browser: browserAgent('Safari'),
		os: osAgent('iOS'),
		origin: originAgent(false),
	},
	{
		id: 'visit-3',
		time: '23 min ago',
		referrer: referrerAgent('Instagram'),
		device: deviceAgent('mobile'),
		browser: browserAgent('Chrome'),
		os: osAgent('Android'),
		origin: originAgent(false),
	},
	{
		id: 'visit-4',
		time: '41 min ago',
		referrer: referrerAgent('LinkedIn'),
		device: deviceAgent('tablet'),
		browser: browserAgent('Safari'),
		os: osAgent('iPadOS'),
		origin: originAgent(false),
	},
	{
		id: 'visit-5',
		time: '1 hour ago',
		referrer: referrerAgent('Direct'),
		device: deviceAgent('bot'),
		browser: browserAgent(null),
		os: osAgent(null),
		origin: originAgent(true),
	},
] as const;

export function RecentVisitsSection() {
	return (
		<section aria-labelledby='recent-visits-title' className='border-border border-t'>
			<div className='mx-auto max-w-7xl px-6 py-14 sm:py-18 lg:px-12'>
				<div className='grid gap-4 pb-8 sm:gap-6 md:grid-cols-2 md:items-end md:pb-10'>
					<div>
						<p className='flex items-center gap-2 font-medium'>
							<Icon name='cursor-click' aria-hidden className='size-4 shrink-0' />
							Visit insights
						</p>
						<h2
							id='recent-visits-title'
							className='mt-1.5 text-balance font-semibold text-3xl tracking-tight sm:text-4xl'
						>
							See what each click tells you.
						</h2>
					</div>
					<p className='max-w-xl text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg md:justify-self-end'>
						Get a useful picture of recent visits, without displaying IP addresses.
					</p>
				</div>

				<Card.Root>
					<Card.Header>
						<Card.Title>Recent visits</Card.Title>
						<Card.Description>
							Illustrative visits · IP addresses aren’t shown.
						</Card.Description>
					</Card.Header>
					<Card.Panel>
						<div className='md:hidden'>
							<ul aria-label='Example recent visits' className='divide-y divide-border'>
								{recentVisits.map((visit) => (
									<li
										key={visit.id}
										className='flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0'
									>
										<div className='min-w-0 space-y-2'>
											<AgentBadgeCell {...visit.referrer} />
											<div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs'>
												<AgentLabelCell {...visit.device} />
												<span className='truncate'>{visit.browser.label}</span>
												<span>{visit.origin.label}</span>
											</div>
										</div>
										<time className='shrink-0 text-muted-foreground text-xs tabular-nums'>
											{visit.time}
										</time>
									</li>
								))}
							</ul>
						</div>

						<div className='hidden md:block'>
							<Table.Root>
								<Table.Viewport>
									<Table.Content aria-label='Example recent visits' className='min-w-160'>
										<Table.Header>
											<Table.Row>
												<Table.Head>Time</Table.Head>
												<Table.Head>Referrer</Table.Head>
												<Table.Head>Device</Table.Head>
												<Table.Head>Browser</Table.Head>
												<Table.Head>OS</Table.Head>
												<Table.Head>Origin</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{recentVisits.map((visit) => (
												<Table.Row key={visit.id}>
													<Table.Cell>
														<time className='whitespace-nowrap text-muted-foreground'>
															{visit.time}
														</time>
													</Table.Cell>
													<Table.Cell>
														<AgentBadgeCell {...visit.referrer} />
													</Table.Cell>
													<Table.Cell>
														<AgentLabelCell {...visit.device} />
													</Table.Cell>
													<Table.Cell>
														<AgentBadgeCell {...visit.browser} />
													</Table.Cell>
													<Table.Cell>
														<AgentLabelCell {...visit.os} />
													</Table.Cell>
													<Table.Cell>
														<AgentLabelCell {...visit.origin} />
													</Table.Cell>
												</Table.Row>
											))}
										</Table.Body>
									</Table.Content>
								</Table.Viewport>
							</Table.Root>
						</div>
					</Card.Panel>
				</Card.Root>
			</div>
		</section>
	);
}

function AgentLabelCell({ icon, label }: { icon: string; label: string }) {
	return (
		<span className='flex items-center gap-2'>
			<Icon name={icon} aria-hidden className='size-4 shrink-0 text-muted-foreground' />
			<span className='truncate'>{label}</span>
		</span>
	);
}

function AgentBadgeCell({ label, className }: { label: string; className?: string }) {
	return (
		<Badge className={cn('max-w-48', className)} title={label}>
			<span className='min-w-0 truncate'>{label}</span>
		</Badge>
	);
}
