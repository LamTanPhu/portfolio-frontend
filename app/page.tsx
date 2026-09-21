import type { Metadata } from "next";
import { HomePage } from "@/src/presentation/pages/HomePage";
import { loadSocialAccounts } from "@/src/application/use-cases/queries/social/loadSocialAccounts"
import { SITE_URL } from "@/lib/constants"

const description = "Software Engineer & Portfolio — Lam Tan Phu. Full-stack development, backend systems, and game development."

export const metadata: Metadata = {
  description,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title:       "Lam Tan Phu",
    description,
    url:         SITE_URL,
    type:        "website",
  },
  twitter: {
    card:        "summary",
    title:       "Lam Tan Phu",
    description,
  },
}

export default async function Page() {
  const socialAccounts = await loadSocialAccounts()
  return <HomePage socialAccounts={socialAccounts} />
}