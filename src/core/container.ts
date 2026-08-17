import 'reflect-metadata';

import { ContainerBuilder } from 'diod';

import { VisitRecorder } from '#/contexts/analytics/visits/application/record/visit-recorder';
import { OnLinkResolved } from '#/contexts/analytics/visits/application/subscribers/on-link-resolved';
import { UserAgentParser } from '#/contexts/analytics/visits/domain/user-agent-parser';
import { VisitRepository } from '#/contexts/analytics/visits/domain/visit-repository';
import { NodeDeviceDetectorUserAgentParser } from '#/contexts/analytics/visits/infrastructure/node-device-detector-user-agent-parser';
import { PostgresVisitRepository } from '#/contexts/analytics/visits/infrastructure/postgres-visit-repository';
import { LinkDeleter } from '#/contexts/brevis/links/application/delete/link-deleter';
import { AvailableSlugSuggester } from '#/contexts/brevis/links/application/generate/available-slug-suggester';
import { SlugCompletionSuggester } from '#/contexts/brevis/links/application/generate/slug-completion-suggester';
import { SlugAvailabilityChecker } from '#/contexts/brevis/links/application/search-one/slug-availability-checker.ts';
import { OnLinkCreated } from '#/contexts/brevis/links/application/subscribers/on-link-created';
import { LinkUpserter } from '#/contexts/brevis/links/application/upsert/link-upserter';
import { LinkCreatedEvent } from '#/contexts/brevis/links/domain/events/link-created-event';
import { LinkDeletedEvent } from '#/contexts/brevis/links/domain/events/link-deleted-event';
import { LinkUpdatedEvent } from '#/contexts/brevis/links/domain/events/link-updated-event';
import { LinkRepository as BrevisLinkRepository } from '#/contexts/brevis/links/domain/link-repository';
import { MetaCollector } from '#/contexts/brevis/links/domain/meta-collector';
import { SlugGenerator } from '#/contexts/brevis/links/domain/slug-generator';
import { GatewayAiSlugGenerator } from '#/contexts/brevis/links/infrastructure/ai-slug-generator';
import { FriendlyWordsSlugGenerator } from '#/contexts/brevis/links/infrastructure/friendly-words-slug-generator';
import { OpenGraphScraperMetaCollector } from '#/contexts/brevis/links/infrastructure/open-graph-scraper-meta-collector';
import { PostgresLinkRepository } from '#/contexts/brevis/links/infrastructure/postgres-link-repository';
import { LinkResolver } from '#/contexts/redirect/links/application/resolve/link-resolver';
import { LinkResolvedEvent } from '#/contexts/redirect/links/domain/events/link-resolved-event';
import { LinkRepository as RedirectLinkRepository } from '#/contexts/redirect/links/domain/link-repository';
import { PostgresLinkRepository as RedirectPostgresLinkRepository } from '#/contexts/redirect/links/infrastructure/postgres-link-repository';
import { DomainEventMapping } from '#/contexts/shared/domain/events/domain-event-mapping';
import { EventBus } from '#/contexts/shared/domain/events/event-bus';
import { BullMqConnection } from '#/contexts/shared/infrastructure/bullmq/connection';
import { BullMqEventBus } from '#/contexts/shared/infrastructure/bullmq/event-bus';
import { PostgresConnection } from '#/contexts/shared/infrastructure/postgres/connection';

import { registerSubscribers } from './register-subscribers';

const builder = new ContainerBuilder();

/* -------------------------------------------------------------------------- */
/*  SHARED INFRASTRUCTURE
/* -------------------------------------------------------------------------- */

builder.registerAndUse(PostgresConnection);
builder.registerAndUse(BullMqConnection);
builder.registerAndUse(OnLinkCreated);

const domainEventMapping = new DomainEventMapping({
	[LinkCreatedEvent.EVENT_NAME]: LinkCreatedEvent,
	[LinkUpdatedEvent.EVENT_NAME]: LinkUpdatedEvent,
	[LinkDeletedEvent.EVENT_NAME]: LinkDeletedEvent,
	[LinkResolvedEvent.EVENT_NAME]: LinkResolvedEvent,
});
// biome-ignore lint/correctness/useHookAtTopLevel: diod registration, not a React hook
builder.register(DomainEventMapping).useInstance(domainEventMapping);

builder
	.register(EventBus)
	.use(BullMqEventBus)
	.withDependencies([BullMqConnection, DomainEventMapping])
	.asSingleton();

/* -------------------------------------------------------------------------- */
/*  BREVIS
/* -------------------------------------------------------------------------- */

builder.registerAndUse(PostgresLinkRepository).withDependencies([PostgresConnection]);
builder
	.register(BrevisLinkRepository)
	.use(PostgresLinkRepository)
	.withDependencies([PostgresConnection]);
builder.registerAndUse(FriendlyWordsSlugGenerator);
builder.registerAndUse(GatewayAiSlugGenerator);
builder.register(SlugGenerator).use(FriendlyWordsSlugGenerator);
builder.register(MetaCollector).use(OpenGraphScraperMetaCollector);
builder
	.registerAndUse(AvailableSlugSuggester)
	.withDependencies([SlugGenerator, BrevisLinkRepository]);
builder
	.registerAndUse(SlugCompletionSuggester)
	.withDependencies([MetaCollector, GatewayAiSlugGenerator, BrevisLinkRepository]);
builder.registerAndUse(SlugAvailabilityChecker).withDependencies([BrevisLinkRepository]);
builder.registerAndUse(LinkUpserter).withDependencies([BrevisLinkRepository, EventBus]);
builder.registerAndUse(LinkDeleter).withDependencies([BrevisLinkRepository, EventBus]);

/* -------------------------------------------------------------------------- */
/*  REDIRECT
/* -------------------------------------------------------------------------- */

builder
	.registerAndUse(RedirectPostgresLinkRepository)
	.withDependencies([PostgresConnection]);
builder
	.register(RedirectLinkRepository)
	.use(RedirectPostgresLinkRepository)
	.withDependencies([PostgresConnection]);
builder.registerAndUse(LinkResolver).withDependencies([RedirectLinkRepository, EventBus]);

/* -------------------------------------------------------------------------- */
/*  ANALYTICS
/* -------------------------------------------------------------------------- */

builder.registerAndUse(PostgresVisitRepository).withDependencies([PostgresConnection]);
builder
	.register(VisitRepository)
	.use(PostgresVisitRepository)
	.withDependencies([PostgresConnection]);
builder.registerAndUse(NodeDeviceDetectorUserAgentParser);
builder.register(UserAgentParser).use(NodeDeviceDetectorUserAgentParser);
builder
	.registerAndUse(VisitRecorder)
	.withDependencies([VisitRepository, UserAgentParser]);
builder.registerAndUse(OnLinkResolved).withDependencies([VisitRecorder]);

export const container = builder.build();

registerSubscribers(container);
