import { Service } from 'diod';

import type { Visit, VisitEventId, VisitLinkId } from '../domain/visit';
import type { VisitRepository } from '../domain/visit-repository';

@Service()
export class InMemoryVisitRepository implements VisitRepository {
	private storageById: Map<Visit['id'], Visit> = new Map();
	private eventIds: Set<VisitEventId> = new Set();

	async save(visit: Visit): Promise<void> {
		this.storageById.set(visit.id, visit);
		this.eventIds.add(visit.eventId);
	}

	async existsByEventId(eventId: VisitEventId): Promise<boolean> {
		return this.eventIds.has(eventId);
	}

	async findByLinkId(linkId: VisitLinkId): Promise<Visit> {
		for (const visit of this.storageById.values()) {
			if (visit.linkId === linkId) {
				return visit;
			}
		}

		throw new Error(`Visit for link "${linkId}" not found`);
	}

	async findAll(): Promise<Visit[]> {
		return [...this.storageById.values()];
	}
}
