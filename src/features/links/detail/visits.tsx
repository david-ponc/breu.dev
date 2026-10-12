import { useSuspenseQuery } from '@tanstack/react-query';
import { use } from 'react';
import { browser } from 'react-dom';

import { CursorClickIcon } from '#/core/icons/cursor-click';
import { Icon } from '#/core/icons/icon';
import { cn } from '#/core/lib/cn';
import { Badge } from '#/core/ui/badge';
import { Card } from '#/core/ui/card';
import { Empty } from '#/core/ui/empty';
import { GridPattern } from '#/core/ui/patterns/grid-pattern';
import { Table } from '#/core/ui/table';

import { formatDateTime, formatReferrerHost } from './format';
import { linkVisitsQueryOptions } from './query';
import {
	type AgentBadge,
	type AgentMeta,
	browserAgent,
	deviceAgent,
	originAgent,
	osAgent,
	referrerAgent,
} from './visit-agent';

interface LinkDetailVisitsProps {
	linkId: string;
	userId: string;
}

export function LinkDetailVisits({ linkId, userId }: LinkDetailVisitsProps) {
	use(browser());
	const { data: visits } = useSuspenseQuery(linkVisitsQueryOptions(userId, linkId));

	if (visits.length === 0) {
		return (
			<Empty.Root className='relative' data-stagger>
				<GridPattern />
				<Empty.Media variant='icon'>
					<CursorClickIcon />
				</Empty.Media>
				<Empty.Header className='z-1'>
					<Empty.Title>No visits yet</Empty.Title>
					<Empty.Description>
						Share your link to start tracking clicks. Recent visits will appear here.
					</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		);
	}

	return (
		<Card.Root data-stagger>
			<Card.Header>
				<Card.Title>Recent visits</Card.Title>
				<Card.Description>Latest 50 clicks, without IP addresses.</Card.Description>
			</Card.Header>
			<Card.Panel>
				<Table.Root>
					<Table.Viewport>
						<Table.Content aria-label='Recent visits' className='min-w-180'>
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
								{visits.map((visit) => (
									<Table.Row key={visit.id}>
										<Table.Cell>
											<time
												dateTime={visit.visitedAt}
												className='whitespace-nowrap text-muted-foreground'
											>
												{formatDateTime(visit.visitedAt)}
											</time>
										</Table.Cell>
										<Table.Cell>
											<AgentBadgeCell
												{...referrerAgent(formatReferrerHost(visit.referer))}
											/>
										</Table.Cell>
										<Table.Cell>
											<AgentLabelCell
												{...deviceAgent(visit.userAgent?.deviceType ?? 'unknown')}
											/>
										</Table.Cell>
										<Table.Cell>
											<AgentBadgeCell
												{...browserAgent(visit.userAgent?.browser ?? null)}
											/>
										</Table.Cell>
										<Table.Cell>
											<AgentLabelCell {...osAgent(visit.userAgent?.os ?? null)} />
										</Table.Cell>
										<Table.Cell>
											<AgentLabelCell {...originAgent(visit.isBot)} />
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Content>
					</Table.Viewport>
				</Table.Root>
			</Card.Panel>
		</Card.Root>
	);
}

function AgentLabelCell({ icon, label }: AgentMeta) {
	return (
		<span className='flex items-center gap-2'>
			<Icon name={icon} aria-hidden className='size-4 shrink-0 text-muted-foreground' />
			<span className='truncate'>{label}</span>
		</span>
	);
}

function AgentBadgeCell({ label, className }: AgentBadge) {
	return (
		<Badge className={cn('max-w-48', className)} title={label}>
			<span className='min-w-0 truncate'>{label}</span>
		</Badge>
	);
}
