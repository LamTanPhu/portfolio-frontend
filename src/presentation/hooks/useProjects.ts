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
      .then((r) => r.json())
      .then((data: ProjectSummaryDTO[]) => { setProjects(data); setLoading(false) })
      .catch(() => { setError('Failed to load projects'); setLoading(false) })
  }, [])

  return { projects, loading, error }
}