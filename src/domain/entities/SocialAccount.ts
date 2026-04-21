export class SocialAccount {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly url: string,
    public readonly imageUrl: string,
    public readonly isPublic: boolean,
  ) {}
}
