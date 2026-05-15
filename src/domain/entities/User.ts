export class User {
  constructor(
    public readonly id: number,
    public readonly firstname: string,
    public readonly lastname: string,
    public readonly email: string,
    public readonly aboutme: string | null,
  ) {}
  get fullName(): string {
    return `${this.firstname} ${this.lastname}`
  }
}