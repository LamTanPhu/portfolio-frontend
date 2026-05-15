// app/layout.tsx
import type { Metadata } from 'next'
import { jetbrainsMono } from '../lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lam Tan Phu - Portfolio',
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
        {children}
      </body>
    </html>
  )
}