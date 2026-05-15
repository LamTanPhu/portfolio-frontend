'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

// =============================================================================
// AuthContext
// Manages admin JWT access token in memory — never in localStorage.
// Token lives only for the session — cleared on refresh.
// =============================================================================
interface AuthContextValue {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue>({
  accessToken:     null,
  setAccessToken:  () => {},
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const handleSetToken = useCallback((token: string | null) => {
    setAccessToken(token)
  }, [])

  return (
    <AuthContext.Provider value={{
      accessToken,
      setAccessToken: handleSetToken,
      isAuthenticated: accessToken !== null,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
