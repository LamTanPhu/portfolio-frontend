import type { Metadata } from "next";
import { HomePage } from "@/src/presentation/pages/HomePage";
import { loadPublicSocialAccounts } from "@/src/application/use-cases/queries/social/loadPublicSocialAccounts"
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
  const socialAccounts = await loadPublicSocialAccounts()
  return <HomePage socialAccounts={socialAccounts} />
}