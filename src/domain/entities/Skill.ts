export type SkillCategory = 'frontend' | 'backend' | 'devops' | 'database' | 'other'
export class Skill {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly imageUrl: string | null,
    public readonly category: SkillCategory,
  ) {}
}