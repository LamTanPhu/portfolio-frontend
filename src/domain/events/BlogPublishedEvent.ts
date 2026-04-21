export class BlogPublishedEvent {
  constructor(
    public readonly blogId: number,
    public readonly slug: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
