'use client'
import Script from 'next/script'
import { useRef } from 'react'

interface Props { onVerify: (token: string) => void }

export function TurnstileWidget({ onVerify }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={() => {
          if (ref.current && (window as any).turnstile) {
            ;(window as any).turnstile.render(ref.current, {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
              callback: onVerify,
            })
          }
        }}
      />
      <div ref={ref} />
    </>
  )
}
