export class Slug {
  private readonly value: string

  constructor(raw: string) {
    this.value = raw.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  static from(title: string): Slug { return new Slug(title) }

  toString(): string { return this.value }
}
