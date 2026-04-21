export class Blog {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly slug: string,
    public readonly content: string,
    public readonly tags: string[],
    public readonly isPublished: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
