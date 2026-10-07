'use client'
import { API_URL } from '@/lib/constants'
import { useEffect, useState } from 'react'
import type { ProjectSummaryDTO } from '../../application/dtos/project/ProjectSummaryDTO'

// =============================================================================
// useProjects
// Client-side project fetching — use server loaders when possible.
// Falls back to this hook for client-only interactions.
// GET /projects returns summaries only (no description) — see ProjectSummaryDTO.
// =============================================================================
export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummaryDTO[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    window.fetch(`${API_URL}/projects`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: unknown) => {
        // An error body or an unexpected shape must not end up in state as the project list.
        if (!Array.isArray(data)) throw new Error('unexpected response')
        setProjects(data as ProjectSummaryDTO[])
        setLoading(false)
      })
      .catch(() => { setError('Failed to load projects'); setLoading(false) })
  }, [])

  return { projects, loading, error }
}