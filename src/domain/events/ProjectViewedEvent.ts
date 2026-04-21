export class ProjectViewedEvent {
  constructor(
    public readonly projectId: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
