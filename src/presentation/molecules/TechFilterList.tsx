import type { ReactNode } from 'react'
import {
    SiAngular,
    SiCss,
    SiFlutter,
    SiGatsby,
    SiHtml5,
    SiNextdotjs,
    SiNodedotjs,
    SiPostgresql,
    SiReact,
    SiTailwindcss,
    SiTypescript,
    SiVuedotjs,
} from 'react-icons/si'
import { TechCheckbox } from '../atoms/TechCheckbox'

// =============================================================================
// TechFilterList — Molecule
// Full list of tech filter checkboxes. Icons from react-icons/si.
// =============================================================================

interface TechItem {
    label: string
    icon:  ReactNode
}

const TECHS: TechItem[] = [
    { label: 'React',      icon: <SiReact       className="text-[#61dafb]" /> },
    { label: 'Next.js',    icon: <SiNextdotjs   className="text-(--text-primary)" /> },
    { label: 'TypeScript', icon: <SiTypescript  className="text-[#3178c6]" /> },
    { label: 'HTML',       icon: <SiHtml5       className="text-[#e34f26]" /> },
    { label: 'CSS',        icon: <SiCss         className="text-[#1572b6]" /> },
    { label: 'Tailwind',   icon: <SiTailwindcss className="text-[#38bdf8]" /> },
    { label: 'Vue',        icon: <SiVuedotjs    className="text-[#42b883]" /> },
    { label: 'Angular',    icon: <SiAngular     className="text-[#dd0031]" /> },
    { label: 'Node.js',    icon: <SiNodedotjs   className="text-[#339933]" /> },
    { label: 'PostgreSQL', icon: <SiPostgresql  className="text-[#4169e1]" /> },
    { label: 'Gatsby',     icon: <SiGatsby      className="text-[#663399]" /> },
    { label: 'Flutter',    icon: <SiFlutter     className="text-[#02569b]" /> },
]

interface Props {
    selected: string[]
    onChange: (label: string) => void
}

export function TechFilterList({ selected, onChange }: Props) {
    return (
        <div className="flex flex-col px-2 py-2 gap-0.5">
            {TECHS.map((tech) => (
                <TechCheckbox
                key={tech.label}
                label={tech.label}
                icon={tech.icon}
                checked={selected.includes(tech.label)}
                onChange={onChange}
                />
            ))}
        </div>
    )
}