'use client'
import { useEffect, useState } from 'react'

// =============================================================================
// useDebouncedValue
// Returns `value`, but only after it's stopped changing for `delayMs`.
// Used to avoid firing a network request on every keystroke (e.g. blog
// search, which is also rate-limited server-side at 60 req/min).
// =============================================================================
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
