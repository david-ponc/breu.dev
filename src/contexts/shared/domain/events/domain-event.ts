import { Identifier } from '#/core/lib/identifier';

export abstract class DomainEvent<T = unknown> {
	readonly eventId: string;
	readonly occurredOn: Date;
	abstract readonly eventName: string;
	readonly payload: T;

	constructor(payload: T, eventId?: string, occurredOn?: Date) {
		this.eventId = eventId ?? Identifier.generate();
		this.occurredOn = occurredOn ?? new Date();
		this.payload = payload;
	}

	toPrimitives(): {
		eventId: string;
		eventName: string;
		occurredOn: string;
		payload: T;
	} {
		return {
			eventId: this.eventId,
			eventName: this.eventName,
			occurredOn: this.occurredOn.toISOString(),
			payload: this.payload,
		};
	}
}
