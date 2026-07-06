// app/layout.tsx
import type { Metadata } from 'next'
import { jetbrainsMono } from '../lib/fonts'
import { PageViewTracker } from '@/src/presentation/organisms/PageViewTracker'
import { SITE_URL } from '@/lib/constants'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  'Lam Tan Phu - Portfolio',
    template: '%s | Lam Tan Phu',
  },
  description: 'Software Engineer & Portfolio',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <PageViewTracker />
        {children}
      </body>
    </html>
  )
}