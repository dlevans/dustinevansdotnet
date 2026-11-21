import { Reveal } from '../components/Reveal'
import Link from '../components/Link'

export default function ProjectPage({ project }) {
  const { title, description, tags, details = [], archived, image, link, linkLabel, repo, playStore } = project
  const hasLinks = link || repo || playStore
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
          {hasLinks && (
            <div className="project__links">
              {link && (
                <a className="btn" href={link} target="_blank" rel="noreferrer">
                  {linkLabel ? `View on ${linkLabel}` : 'Check it out'} ↗
                </a>
              )}
              {repo && (
                <a className="btn btn--ghost" href={repo} target="_blank" rel="noreferrer">
                  View on GitHub ↗
                </a>
              )}
              {playStore && (
                <a className="project__store" href={playStore} target="_blank" rel="noreferrer">
                  <img src="/badges/google-play.png" alt="Get it on Google Play" width="155" height="60" />
                </a>
              )}
            </div>
          )}
        </Reveal>

        {image && (
          <Reveal delay={40}>
            <img className="project__image" src={image} alt={`${title} screenshot`} />
          </Reveal>
        )}

        <Reveal className="prose" delay={80}>
          {details.map(({ heading, text, items, links }) => (
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
              {links && (
                <ul>
                  {links.map(({ label, url }) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer">
                        {label} ↗
                      </a>
                    </li>
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
