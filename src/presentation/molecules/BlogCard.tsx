import type { BlogDTO } from '../../application/dtos/BlogDTO'
import { Badge } from '../atoms/Badge'

interface Props { blog: BlogDTO }

export function BlogCard({ blog }: Props) {
  return (
    <a href={`/blog/${blog.slug}`} className="block border border-[#3c3c3c] bg-[#1e1e1e] p-4 hover:border-[#007acc] transition-colors">
      <h3 className="font-mono text-sm text-[#cccccc] mb-1">{blog.title}</h3>
      {blog.excerpt && <p className="font-mono text-[11px] text-[#858585] mb-3 line-clamp-2">{blog.excerpt}</p>}
      <div className="flex flex-wrap gap-1">
        {blog.tags.map(tag => <Badge key={tag} label={tag} />)}
      </div>
    </a>
  )
}
