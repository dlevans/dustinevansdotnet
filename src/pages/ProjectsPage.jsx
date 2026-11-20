import { useState } from 'react'
import { projects } from '../data/site'
import { Reveal } from '../components/Reveal'
import { ProjectGrid } from '../components/ProjectCard'
import Link from '../components/Link'

export default function ProjectsPage() {
  const [tag, setTag] = useState('All')
  const tags = [
    'All',
    ...new Set(projects.flatMap((p) => p.tags)),
    ...(projects.some((p) => p.archived) ? ['Archived'] : []),
  ]
  const items =
    tag === 'All'
      ? projects
      : projects.filter((p) => (tag === 'Archived' ? p.archived : p.tags.includes(tag)))

  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/" className="page__back mono">← back home</Link>
          <p className="mono kicker">showcase</p>
          <h1 className="page__title">
            All <span className="gradient-text">projects</span>
          </h1>
          <p className="section-lead">
            Everything I've built — web apps, tools, maps, and experiments. {projects.length} and counting.
          </p>
        </Reveal>

        <Reveal className="filters" delay={80}>
          {tags.map((t) => (
            <button
              type="button"
              key={t}
              className={`filter ${t === tag ? 'is-active' : ''}`}
              onClick={() => setTag(t)}
              aria-pressed={t === tag}
            >
              {t}
            </button>
          ))}
        </Reveal>

        <ProjectGrid key={tag} items={items} />
      </div>
    </section>
  )
}
