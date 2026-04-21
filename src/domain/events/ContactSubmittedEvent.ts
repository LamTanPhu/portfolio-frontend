export class ContactSubmittedEvent {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly message: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
