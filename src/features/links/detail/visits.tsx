import { useSuspenseQuery } from '@tanstack/react-query';
import { use } from 'react';
import { browser } from 'react-dom';

import { Badge } from '#/core/ui/badge';
import { Card } from '#/core/ui/card';
import { Table } from '#/core/ui/table';

import { formatDateTime, formatDevice, formatReferrerHost } from './format';
import { linkVisitsQueryOptions } from './query';

interface LinkDetailVisitsProps {
	linkId: string;
	userId: string;
}

export function LinkDetailVisits({ linkId, userId }: LinkDetailVisitsProps) {
	use(browser());
	const { data: visits } = useSuspenseQuery(linkVisitsQueryOptions(userId, linkId));

	return (
		<Card.Root data-stagger>
			<Card.Header>
				<Card.Title>Recent visits</Card.Title>
				<Card.Description>Latest 50 clicks, without IP addresses.</Card.Description>
			</Card.Header>
			<Card.Panel>
				{visits.length === 0 ? (
					<p className='py-8 text-center text-muted-foreground text-sm'>
						No visits recorded yet.
					</p>
				) : (
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
										<Table.Head>Bot</Table.Head>
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
											<Table.Cell className='max-w-48 truncate'>
												{formatReferrerHost(visit.referer)}
											</Table.Cell>
											<Table.Cell>
												{formatDevice(visit.userAgent?.deviceType ?? 'unknown')}
											</Table.Cell>
											<Table.Cell>{visit.userAgent?.browser ?? 'Unknown'}</Table.Cell>
											<Table.Cell>{visit.userAgent?.os ?? 'Unknown'}</Table.Cell>
											<Table.Cell>
												{visit.isBot ? <Badge variant='warning'>Bot</Badge> : '—'}
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table.Content>
						</Table.Viewport>
					</Table.Root>
				)}
			</Card.Panel>
		</Card.Root>
	);
}
