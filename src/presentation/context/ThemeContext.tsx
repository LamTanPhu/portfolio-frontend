'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

// =============================================================================
// ThemeContext
// VS Code-inspired theme — dark mode only for this portfolio.
// Kept minimal — extend if light mode support is added later.
// =============================================================================
type Theme = 'dark'

interface ThemeContextValue {
  theme: Theme
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark' })

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
