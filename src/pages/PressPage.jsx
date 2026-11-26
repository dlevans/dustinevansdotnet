import { press } from '../data/site'
import { Reveal } from '../components/Reveal'
import Link from '../components/Link'
import { formatDate } from '../data/dates'

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export default function PressPage() {
  const years = [...new Set(press.map((p) => p.date.slice(0, 4)))]

  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/" className="page__back mono">← back home</Link>
          <p className="mono kicker">press</p>
          <h1 className="page__title">
            In the <span className="gradient-text">press</span>
          </h1>
          <p className="section-lead">
            Articles, interviews, and features about me and my projects over the years.
          </p>
        </Reveal>

        {press.length === 0 ? (
          <p className="muted">Nothing here yet. Check back soon.</p>
        ) : (
          years.map((year) => (
            <Reveal key={year} className="press__year">
              <h2 className="press__year-title mono">{year}</h2>
              <ul className="press__list">
                {press
                  .filter((p) => p.date.startsWith(year))
                  .map((p) => (
                    <li key={p.url} className="press__item">
                      <a href={p.url} target="_blank" rel="noreferrer" className="press__link">
                        <p className="press__meta mono">
                          <span className="press__outlet">{p.outlet}</span>
                          <span>{formatDate(p.date)}</span>
                          {p.type && <span>{p.type}</span>}
                        </p>
                        <h3 className="press__title">
                          {p.title} <span aria-hidden>↗</span>
                        </h3>
                        {p.summary && <p className="press__summary">{p.summary}</p>}
                        <span className="press__host mono">{host(p.url)}</span>
                      </a>
                    </li>
                  ))}
              </ul>
            </Reveal>
          ))
        )}
      </div>
    </section>
  )
}
