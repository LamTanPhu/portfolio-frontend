import { HomePage } from "@/src/presentation/pages/HomePage";
import { loadSocialAccounts } from "@/src/application/use-cases/queries/social/loadSocialAccounts"

export default async function Page() {
  const socialAccounts = await loadSocialAccounts()
  return <HomePage socialAccounts={socialAccounts} />
}