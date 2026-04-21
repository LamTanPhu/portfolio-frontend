export class Certification {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly url: string,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly isPublished: boolean,
  ) {}
}
