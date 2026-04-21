export class Project {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly slug: string,
    public readonly techStack: string[],
    public readonly isPublished: boolean,
    public readonly isOpenSource: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
