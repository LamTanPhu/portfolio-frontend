# Run this from inside your portfolio-frontend directory
# cd portfolio-frontend
# .\scaffold-frontend.ps1

$dirs = @(
  "src/domain/entities",
  "src/domain/value-objects",
  "src/domain/services",
  "src/domain/repositories/project",
  "src/domain/repositories/blog",
  "src/domain/repositories/contact",
  "src/domain/errors",
  "src/domain/events",
  "src/application/use-cases/commands/contact",
  "src/application/use-cases/commands/project",
  "src/application/use-cases/commands/blog",
  "src/application/use-cases/queries/project",
  "src/application/use-cases/queries/blog",
  "src/application/use-cases/queries/skill",
  "src/application/event-handlers",
  "src/application/ports",
  "src/application/dtos",
  "src/infrastructure/repositories",
  "src/infrastructure/mappers",
  "src/infrastructure/api",
  "src/infrastructure/cloudflare",
  "src/presentation/atoms",
  "src/presentation/molecules",
  "src/presentation/organisms",
  "src/presentation/templates",
  "src/presentation/hooks",
  "src/presentation/server/loaders"
)

foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Write-Host "Folders created." -ForegroundColor Green

# ─── Domain / Entities ───────────────────────────────────────────────────────

Set-Content "src/domain/entities/User.ts" @"
export class User {
  constructor(
    public readonly id: number,
    public readonly firstname: string,
    public readonly lastname: string,
    public readonly email: string,
    public readonly aboutme: string,
  ) {}

  get fullName(): string {
    return `${this.firstname} ${this.lastname}`
  }
}
"@

Set-Content "src/domain/entities/Project.ts" @"
export class Project {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly slug: string,
    public readonly techStack: string[],
    public readonly isPublished: boolean,
    public readonly isOpenSource: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
"@

Set-Content "src/domain/entities/Blog.ts" @"
export class Blog {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly slug: string,
    public readonly content: string,
    public readonly tags: string[],
    public readonly isPublished: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
"@

Set-Content "src/domain/entities/Skill.ts" @"
export type SkillCategory = 'frontend' | 'backend' | 'devops' | 'database' | 'other'

export class Skill {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly imageUrl: string,
    public readonly category: SkillCategory,
    public readonly isPublic: boolean,
  ) {}
}
"@

Set-Content "src/domain/entities/Education.ts" @"
export class Education {
  constructor(
    public readonly id: number,
    public readonly degreeName: string,
    public readonly instituteName: string,
    public readonly instituteUrl: string,
    public readonly startedAt: Date,
    public readonly endedAt: Date | null,
    public readonly isCompleted: boolean,
  ) {}
}
"@

Set-Content "src/domain/entities/Job.ts" @"
export class Job {
  constructor(
    public readonly id: number,
    public readonly companyName: string,
    public readonly role: string,
    public readonly startedAt: Date,
    public readonly endedAt: Date | null,
    public readonly isEnded: boolean,
  ) {}
}
"@

Set-Content "src/domain/entities/Certification.ts" @"
export class Certification {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly url: string,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly isPublished: boolean,
  ) {}
}
"@

Set-Content "src/domain/entities/SocialAccount.ts" @"
export class SocialAccount {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly url: string,
    public readonly imageUrl: string,
    public readonly isPublic: boolean,
  ) {}
}
"@

# ─── Domain / Value Objects ───────────────────────────────────────────────────

Set-Content "src/domain/value-objects/Email.ts" @"
import { ValidationError } from '../errors/ValidationError'

export class Email {
  private readonly value: string

  constructor(email: string) {
    if (!Email.isValid(email)) throw new ValidationError(`Invalid email: ${email}`)
    this.value = email.toLowerCase().trim()
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  toString(): string { return this.value }
}
"@

Set-Content "src/domain/value-objects/Slug.ts" @"
export class Slug {
  private readonly value: string

  constructor(raw: string) {
    this.value = raw.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  static from(title: string): Slug { return new Slug(title) }

  toString(): string { return this.value }
}
"@

Set-Content "src/domain/value-objects/DateRange.ts" @"
import { ValidationError } from '../errors/ValidationError'

export class DateRange {
  constructor(
    public readonly start: Date,
    public readonly end: Date | null,
  ) {
    if (end && end < start) throw new ValidationError('End date cannot be before start date')
  }

  get isOngoing(): boolean { return this.end === null }
}
"@

# ─── Domain / Errors ─────────────────────────────────────────────────────────

Set-Content "src/domain/errors/DomainError.ts" @"
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}
"@

Set-Content "src/domain/errors/ValidationError.ts" @"
import { DomainError } from './DomainError'
export class ValidationError extends DomainError {}
"@

Set-Content "src/domain/errors/NotFoundError.ts" @"
import { DomainError } from './DomainError'
export class NotFoundError extends DomainError {}
"@

Set-Content "src/domain/errors/UnauthorizedError.ts" @"
import { DomainError } from './DomainError'
export class UnauthorizedError extends DomainError {}
"@

# ─── Domain / Events ─────────────────────────────────────────────────────────

Set-Content "src/domain/events/ContactSubmittedEvent.ts" @"
export class ContactSubmittedEvent {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly message: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
"@

Set-Content "src/domain/events/ProjectViewedEvent.ts" @"
export class ProjectViewedEvent {
  constructor(
    public readonly projectId: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
"@

Set-Content "src/domain/events/BlogPublishedEvent.ts" @"
export class BlogPublishedEvent {
  constructor(
    public readonly blogId: number,
    public readonly slug: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
"@

# ─── Domain / Repository Interfaces ──────────────────────────────────────────

Set-Content "src/domain/repositories/project/IProjectReadRepository.ts" @"
import { Project } from '../../entities/Project'

export interface IProjectReadRepository {
  findAll(): Promise<Project[]>
  findPublished(): Promise<Project[]>
  findById(id: number): Promise<Project | null>
  findBySlug(slug: string): Promise<Project | null>
}
"@

Set-Content "src/domain/repositories/project/IProjectWriteRepository.ts" @"
import { Project } from '../../entities/Project'

export interface IProjectWriteRepository {
  create(data: Omit<Project, 'id'>): Promise<Project>
  update(id: number, data: Partial<Project>): Promise<Project>
  delete(id: number): Promise<void>
}
"@

Set-Content "src/domain/repositories/blog/IBlogReadRepository.ts" @"
import { Blog } from '../../entities/Blog'

export interface IBlogReadRepository {
  findAll(): Promise<Blog[]>
  findPublished(): Promise<Blog[]>
  findBySlug(slug: string): Promise<Blog | null>
}
"@

Set-Content "src/domain/repositories/blog/IBlogWriteRepository.ts" @"
import { Blog } from '../../entities/Blog'

export interface IBlogWriteRepository {
  create(data: Omit<Blog, 'id'>): Promise<Blog>
  update(id: number, data: Partial<Blog>): Promise<Blog>
  delete(id: number): Promise<void>
}
"@

Set-Content "src/domain/repositories/contact/IContactWriteRepository.ts" @"
export interface IContactWriteRepository {
  save(data: { name: string; email: string; message: string; ipAddress: string }): Promise<void>
}
"@

# ─── Application / Ports ─────────────────────────────────────────────────────

Set-Content "src/application/ports/ITurnstileVerifier.ts" @"
export interface ITurnstileVerifier {
  verifyToken(token: string): Promise<boolean>
}
"@

# ─── Application / DTOs ──────────────────────────────────────────────────────

Set-Content "src/application/dtos/ProjectDTO.ts" @"
export interface ProjectDTO {
  id: number
  name: string
  description: string
  slug: string
  techStack: string[]
  isOpenSource: boolean
  createdAt: string
}
"@

Set-Content "src/application/dtos/BlogDTO.ts" @"
export interface BlogDTO {
  id: number
  title: string
  slug: string
  content: string
  tags: string[]
  createdAt: string
}
"@

Set-Content "src/application/dtos/TrackDTO.ts" @"
export interface TrackDTO {
  isPlaying: boolean
  title: string
  artist: string
  albumArt: string
  songUrl: string
}
"@

# ─── Application / Use Cases ─────────────────────────────────────────────────

Set-Content "src/application/use-cases/queries/project/GetPublishedProjectsQuery.ts" @"
import { IProjectReadRepository } from '../../../../domain/repositories/project/IProjectReadRepository'
import { ProjectDTO } from '../.././../dtos/ProjectDTO'

export class GetPublishedProjectsQuery {
  constructor(private readonly repo: IProjectReadRepository) {}

  async execute(): Promise<ProjectDTO[]> {
    const projects = await this.repo.findPublished()
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      slug: p.slug,
      techStack: p.techStack,
      isOpenSource: p.isOpenSource,
      createdAt: p.createdAt.toISOString(),
    }))
  }
}
"@

Set-Content "src/application/use-cases/queries/blog/GetPublishedBlogsQuery.ts" @"
import { IBlogReadRepository } from '../../../../domain/repositories/blog/IBlogReadRepository'
import { BlogDTO } from '../../../dtos/BlogDTO'

export class GetPublishedBlogsQuery {
  constructor(private readonly repo: IBlogReadRepository) {}

  async execute(): Promise<BlogDTO[]> {
    const blogs = await this.repo.findPublished()
    return blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      tags: b.tags,
      createdAt: b.createdAt.toISOString(),
    }))
  }
}
"@

Set-Content "src/application/use-cases/commands/contact/SubmitContactCommand.ts" @"
import { IContactWriteRepository } from '../../../../domain/repositories/contact/IContactWriteRepository'
import { ITurnstileVerifier } from '../../../ports/ITurnstileVerifier'
import { ContactSubmittedEvent } from '../../../../domain/events/ContactSubmittedEvent'
import { ValidationError } from '../../../../domain/errors/ValidationError'
import { Email } from '../../../../domain/value-objects/Email'

interface Input {
  name: string
  email: string
  message: string
  turnstileToken: string
  ipAddress: string
}

export class SubmitContactCommand {
  constructor(
    private readonly repo: IContactWriteRepository,
    private readonly turnstile: ITurnstileVerifier,
  ) {}

  async execute(input: Input): Promise<ContactSubmittedEvent> {
    const isHuman = await this.turnstile.verifyToken(input.turnstileToken)
    if (!isHuman) throw new ValidationError('Turnstile verification failed')

    const email = new Email(input.email)

    await this.repo.save({ ...input, email: email.toString() })

    return new ContactSubmittedEvent(input.name, email.toString(), input.message)
  }
}
"@

# ─── Application / Event Handlers ────────────────────────────────────────────

Set-Content "src/application/event-handlers/OnContactSubmitted.ts" @"
import { ContactSubmittedEvent } from '../../domain/events/ContactSubmittedEvent'

export class OnContactSubmitted {
  async handle(event: ContactSubmittedEvent): Promise<void> {
    // Mail notification will be triggered here via IMailService port (backend responsibility)
    console.info(`Contact submitted by ${event.name} at ${event.occurredAt.toISOString()}`)
  }
}
"@

# ─── Infrastructure / API Client ─────────────────────────────────────────────

Set-Content "src/infrastructure/api/httpClient.ts" @"
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}
"@

# ─── Infrastructure / Cloudflare ─────────────────────────────────────────────

Set-Content "src/infrastructure/cloudflare/TurnstileVerifier.ts" @"
import { ITurnstileVerifier } from '../../application/ports/ITurnstileVerifier'

export class TurnstileVerifier implements ITurnstileVerifier {
  private readonly secretKey = process.env.TURNSTILE_SECRET_KEY ?? ''

  async verifyToken(token: string): Promise<boolean> {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: this.secretKey, response: token }),
    })
    const data = await res.json() as { success: boolean }
    return data.success
  }
}
"@

# ─── Infrastructure / Mappers ────────────────────────────────────────────────

Set-Content "src/infrastructure/mappers/ProjectMapper.ts" @"
import { Project } from '../../domain/entities/Project'

export interface RawProject {
  id: number; name: string; description: string; slug: string
  techStack: string[]; isPublished: boolean; isOpenSource: boolean
  createdAt: string; updatedAt: string
}

export class ProjectMapper {
  static toDomain(raw: RawProject): Project {
    return new Project(
      raw.id, raw.name, raw.description, raw.slug,
      raw.techStack, raw.isPublished, raw.isOpenSource,
      new Date(raw.createdAt), new Date(raw.updatedAt),
    )
  }
}
"@

# ─── Infrastructure / Repositories ───────────────────────────────────────────

Set-Content "src/infrastructure/repositories/ApiProjectRepository.ts" @"
import { IProjectReadRepository } from '../../domain/repositories/project/IProjectReadRepository'
import { Project } from '../../domain/entities/Project'
import { ProjectMapper, RawProject } from '../mappers/ProjectMapper'
import { get } from '../api/httpClient'

export class ApiProjectRepository implements IProjectReadRepository {
  async findAll(): Promise<Project[]> {
    const raw = await get<RawProject[]>('/projects')
    return raw.map(ProjectMapper.toDomain)
  }
  async findPublished(): Promise<Project[]> {
    const raw = await get<RawProject[]>('/projects?published=true')
    return raw.map(ProjectMapper.toDomain)
  }
  async findById(id: number): Promise<Project | null> {
    try { return ProjectMapper.toDomain(await get<RawProject>(`/projects/${id}`)) }
    catch { return null }
  }
  async findBySlug(slug: string): Promise<Project | null> {
    try { return ProjectMapper.toDomain(await get<RawProject>(`/projects/slug/${slug}`)) }
    catch { return null }
  }
}
"@

# ─── Presentation / Server Loaders ───────────────────────────────────────────

Set-Content "src/presentation/server/loaders/loadProjects.ts" @"
import { ApiProjectRepository } from '../../../infrastructure/repositories/ApiProjectRepository'
import { GetPublishedProjectsQuery } from '../../../application/use-cases/queries/project/GetPublishedProjectsQuery'
import { ProjectDTO } from '../../../application/dtos/ProjectDTO'

export async function loadProjects(): Promise<ProjectDTO[]> {
  const repo = new ApiProjectRepository()
  const query = new GetPublishedProjectsQuery(repo)
  return query.execute()
}
"@

Set-Content "src/presentation/server/loaders/loadBlogs.ts" @"
import { GetPublishedBlogsQuery } from '../../../application/use-cases/queries/blog/GetPublishedBlogsQuery'
import { BlogDTO } from '../../../application/dtos/BlogDTO'

export async function loadBlogs(): Promise<BlogDTO[]> {
  // Wire ApiProjectRepository equivalent for blogs here
  throw new Error('ApiBlogRepository not yet implemented')
}
"@

# ─── Presentation / Hooks ────────────────────────────────────────────────────

Set-Content "src/presentation/hooks/useProjects.ts" @"
'use client'
import { useEffect, useState } from 'react'
import { ProjectDTO } from '../../application/dtos/ProjectDTO'

export function useProjects() {
  const [projects, setProjects] = useState<ProjectDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects?published=true`)
      .then((r) => r.json())
      .then((data: ProjectDTO[]) => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { projects, loading }
}
"@

# ─── Presentation / Atoms ────────────────────────────────────────────────────

Set-Content "src/presentation/atoms/Button.tsx" @"
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className, children, ...props }: Props) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
"@

Set-Content "src/presentation/atoms/Badge.tsx" @"
import { cn } from '@/lib/utils'

interface Props { label: string; className?: string }

export function Badge({ label, className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground', className)}>
      {label}
    </span>
  )
}
"@

Set-Content "src/presentation/atoms/TurnstileWidget.tsx" @"
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
"@

# ─── Presentation / Molecules ────────────────────────────────────────────────

Set-Content "src/presentation/molecules/ProjectCard.tsx" @"
import { ProjectDTO } from '@/application/dtos/ProjectDTO'
import { Badge } from '../atoms/Badge'

interface Props { project: ProjectDTO }

export function ProjectCard({ project }: Props) {
  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3">
      <h3 className="font-medium text-sm">{project.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-1">
        {project.techStack.map((t) => <Badge key={t} label={t} />)}
      </div>
    </div>
  )
}
"@

Set-Content "src/presentation/molecules/ContactForm.tsx" @"
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
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
"@

# ─── Presentation / Organisms ────────────────────────────────────────────────

Set-Content "src/presentation/organisms/Navbar.tsx" @"
import Link from 'next/link'

const links = [
  { href: '/', label: '_hello' },
  { href: '/about', label: '_about-me' },
  { href: '/projects', label: '_projects' },
  { href: '/contact', label: '_contact-me' },
]

export function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b px-6 h-12 text-sm">
      <span className="font-medium">lam-tan-phu</span>
      <div className="flex gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
"@

Set-Content "src/presentation/organisms/ProjectGrid.tsx" @"
import { ProjectDTO } from '@/application/dtos/ProjectDTO'
import { ProjectCard } from '../molecules/ProjectCard'

interface Props { projects: ProjectDTO[] }

export function ProjectGrid({ projects }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
    </div>
  )
}
"@

# ─── Presentation / Templates ────────────────────────────────────────────────

Set-Content "src/presentation/templates/PublicLayout.tsx" @"
import { Navbar } from '../organisms/Navbar'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t px-6 py-3 text-xs text-muted-foreground text-center">
        find me on: GitHub · LinkedIn
      </footer>
    </div>
  )
}
"@

Set-Content "src/presentation/templates/AdminLayout.tsx" @"
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r p-4 text-sm flex flex-col gap-2">
        <span className="font-medium mb-2">Admin</span>
        <a href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</a>
        <a href="/admin/projects" className="text-muted-foreground hover:text-foreground">Projects</a>
        <a href="/admin/blog" className="text-muted-foreground hover:text-foreground">Blog</a>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
"@

# ─── .env.local ──────────────────────────────────────────────────────────────

Set-Content ".env.local" @"
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
"@

# ─── lib/utils.ts (for cn helper) ────────────────────────────────────────────

New-Item -ItemType Directory -Force -Path "src/lib" | Out-Null
Set-Content "src/lib/utils.ts" @"
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
"@

Write-Host ""
Write-Host "Frontend scaffold complete!" -ForegroundColor Cyan
Write-Host "Next: npm install clsx tailwind-merge" -ForegroundColor Yellow
