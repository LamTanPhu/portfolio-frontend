'use client'
import { useEffect, useState } from 'react'
import { ProjectDTO } from '../../application/dtos/ProjectDTO'

export function useProjects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(${process.env.NEXT_PUBLIC_API_URL}/projects?published=true)
      .then((r) => r.json())
      .then((data: ProjectDTO[]) => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { projects, loading }
}
