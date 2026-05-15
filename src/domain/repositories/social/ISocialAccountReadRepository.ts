import type { SocialAccount } from '../../entities/SocialAccount'
export interface ISocialAccountReadRepository {
  findPublic(): Promise<SocialAccount[]>
}