import { Service } from 'diod';

import type { Visit, VisitEventId, VisitLinkId } from './visit';

@Service()
export abstract class VisitRepository {
	abstract save(visit: Visit): Promise<void>;
	abstract existsByEventId(eventId: VisitEventId): Promise<boolean>;
	abstract findByLinkId(id: VisitLinkId): Promise<Visit>;
}
