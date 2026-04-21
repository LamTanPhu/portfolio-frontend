export class Education {
  constructor(
    public readonly id: number,
    public readonly degreeName: string,
    public readonly instituteName: string,
    public readonly instituteUrl: string,
    public readonly startedAt: Date,
    public readonly endedAt: Date | null,
    public readonly isCompleted: boolean,
  ) {}
}
