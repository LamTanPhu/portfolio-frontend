// =============================================================================
// ProjectCard — Molecule
// Image thumbnail top, title + slug comment, description, view-project button.
// Matches Figma project card layout.
//
// Thumbnail + title link to the internal /projects/[slug] detail page.
// The "view-project" footer button stays external (liveUrl/repoUrl) — same
// pattern as before, just scoped to that one button instead of the whole card.
// =============================================================================

import Link from 'next/link'

interface Props {
  index:       number
  name:        string
  slug:        string
  description: string
  techStack:   string[]
  thumbnailUrl: string | null
  liveUrl:     string | null
  repoUrl:     string | null
}

export function ProjectCard({
  index,
  name,
  slug,
  description,
  thumbnailUrl,
  liveUrl,
  repoUrl,
}: Props) {
  const href = liveUrl ?? repoUrl ?? '#'

  return (
    <article className="flex flex-col rounded-lg border border-(--border-muted) bg-[rgba(1,13,24,0.6)] overflow-hidden hover:border-(--accent-teal) transition-colors duration-200">

      {/* Thumbnail */}
      <Link href={`/projects/${slug}`} className="relative h-44 bg-(--bg-elevated) overflow-hidden block">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-xs text-(--text-muted)">no preview</span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5">

        {/* Title */}
        <header>
          <p className="font-mono text-xs text-(--text-muted) mb-1">
            Project {index}
          </p>
          <h3 className="font-mono text-sm">
            <Link href={`/projects/${slug}`} className="hover:opacity-80 transition-opacity">
              <span className="text-(--accent-teal)">Project {index}</span>
              <span className="text-(--text-muted)">{' // '}</span>
              <span className="text-(--text-primary)">_{slug}</span>
            </Link>
          </h3>
        </header>

        {/* Description */}
        <p className="font-mono text-xs text-(--text-muted) leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* View project button */}
        <footer className="mt-1">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={`View ${name}`}
            className="inline-block font-mono text-xs px-4 py-2 border border-(--border-muted) text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-teal) transition-colors duration-150"
          >
            view-project
          </a>
        </footer>

      </div>
    </article>
  )
}