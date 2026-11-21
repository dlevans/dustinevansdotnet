import { Reveal } from './Reveal'
import Link from './Link'

export default function ProjectCard({ project, index }) {
  const { title, description, tags, image, archived, slug } = project
  const page = slug ? `/projects/${slug}` : null
  const media = (
    <>
      {archived && <span className="card__badge">Archived</span>}
      {image ? (
        <img src={image} alt={`${title} screenshot`} loading="lazy" />
      ) : (
        <span className="card__placeholder">{String(index + 1).padStart(2, '0')}</span>
      )}
    </>
  )
  const onMove = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - py) * 10}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * 12}deg`)
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }
  const onLeave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }
  return (
    <Reveal as="article" className="card-wrap" delay={(index % 3) * 100}>
      <div className="card" onMouseMove={onMove} onMouseLeave={onLeave}>
        {page ? (
          <Link to={page} className="card__media" data-variant={index % 3} aria-label={`${title} details`}>
            {media}
          </Link>
        ) : (
          <div className="card__media" data-variant={index % 3}>
            {media}
          </div>
        )}
        <div className="card__body">
          <h3>{page ? <Link to={page}>{title}</Link> : title}</h3>
          <p>{description}</p>
          <ul className="tags">
            {tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {page && (
            <div className="card__links">
              <Link to={page}>Read more →</Link>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  )
}

/** Grid that uses 3 columns for multiples of 3, otherwise 2. */
export function ProjectGrid({ items }) {
  return (
    <div className="grid" style={{ '--cols': items.length % 3 === 0 ? 3 : 2 }}>
      {items.map((p, i) => (
        <ProjectCard key={p.title} project={p} index={i} />
      ))}
    </div>
  )
}
