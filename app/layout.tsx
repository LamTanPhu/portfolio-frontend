// app/layout.tsx
import type { Metadata } from 'next'
import { jetbrainsMono } from '../lib/fonts'
import { PageViewTracker } from '@/src/presentation/organisms/PageViewTracker'
import { AuthProvider } from '@/src/presentation/context/AuthContext'
import { ThemeProvider } from '@/src/presentation/context/ThemeContext'
import { AmbientAudioProvider } from '@/src/presentation/context/AmbientAudioContext'
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
        <AuthProvider>
          <ThemeProvider>
            <AmbientAudioProvider>
              <PageViewTracker />
              {children}
            </AmbientAudioProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}