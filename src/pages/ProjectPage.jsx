import { Reveal } from '../components/Reveal'
import Link from '../components/Link'

export default function ProjectPage({ project }) {
  const { title, description, tags, details, archived } = project
  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/projects" className="page__back mono">← all projects</Link>
          <p className="mono kicker">{archived ? 'archived project' : 'project'}</p>
          <h1 className="page__title">{title}</h1>
          <p className="section-lead">{description}</p>
          <ul className="tags">
            {tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="prose" delay={80}>
          {details.map(({ heading, text, items }) => (
            <div key={heading}>
              <h2>{heading}</h2>
              {text && <p>{text}</p>}
              {items && (
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {archived && (
            <p className="muted project__note">
              This is an older project, so its original code and files may no longer be available.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
