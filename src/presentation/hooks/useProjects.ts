'use client'
import { API_URL } from '@/lib/constants'
import { useEffect, useState } from 'react'
import type { ProjectDTO } from '../../application/dtos/project/ProjectDTO'

// =============================================================================
// useProjects
// Client-side project fetching — use server loaders when possible.
// Falls back to this hook for client-only interactions.
// =============================================================================
export function useProjects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    window.fetch(`${API_URL}/projects`)
      .then((r) => r.json())
      .then((data: ProjectDTO[]) => { setProjects(data); setLoading(false) })
      .catch(() => { setError('Failed to load projects'); setLoading(false) })
  }, [])

  return { projects, loading, error }
}