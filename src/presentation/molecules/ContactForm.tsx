'use client'
import { useState } from 'react'
import { Button } from '../atoms/Button'
import { TurnstileWidget } from '../atoms/TurnstileWidget'

export function ContactForm() {
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!token) return
    setStatus('sending')
    const fd = new FormData(e.currentTarget)
    const res = await fetch(${process.env.NEXT_PUBLIC_API_URL}/contact, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), message: fd.get('message'), turnstileToken: token }),
    })
    setStatus(res.ok ? 'done' : 'error')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input name="name" placeholder="Name" required className="border rounded p-2 text-sm" />
      <input name="email" type="email" placeholder="Email" required className="border rounded p-2 text-sm" />
      <textarea name="message" placeholder="Message" required rows={4} className="border rounded p-2 text-sm" />
      <TurnstileWidget onVerify={setToken} />
      <Button type="submit" disabled={!token || status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send'}
      </Button>
      {status === 'done' && <p className="text-xs text-green-600">Message sent!</p>}
      {status === 'error' && <p className="text-xs text-red-600">Something went wrong. Try again.</p>}
    </form>
  )
}
