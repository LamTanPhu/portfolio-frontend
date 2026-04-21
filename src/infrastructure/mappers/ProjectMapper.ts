import { Project } from '../../domain/entities/Project'

export interface RawProject {
  id: number; name: string; description: string; slug: string
  techStack: string[]; isPublished: boolean; isOpenSource: boolean
  createdAt: string; updatedAt: string
}

export class ProjectMapper {
  static toDomain(raw: RawProject): Project {
    return new Project(
      raw.id, raw.name, raw.description, raw.slug,
      raw.techStack, raw.isPublished, raw.isOpenSource,
      new Date(raw.createdAt), new Date(raw.updatedAt),
    )
  }
}
