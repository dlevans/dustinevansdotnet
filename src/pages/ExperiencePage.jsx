import { experience } from '../data/site'
import { Reveal } from '../components/Reveal'
import Link from '../components/Link'

/** A vertical timeline of jobs: period, role @ company, and summary. */
export function Timeline({ jobs }) {
  return (
    <ol className="timeline">
      {jobs.map((job, i) => (
        <Reveal as="li" key={`${job.company}-${job.period}`} delay={Math.min(i, 4) * 100}>
          <span className="timeline__period mono">{job.period}</span>
          <h3>
            {job.role} <span className="at">@ {job.company}</span>
          </h3>
          <p>{job.summary}</p>
        </Reveal>
      ))}
    </ol>
  )
}

export default function ExperiencePage() {
  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/" className="page__back mono">← back home</Link>
          <p className="mono kicker">experience</p>
          <h1 className="page__title">
            Where I've <span className="gradient-text">worked</span>
          </h1>
          <p className="section-lead">
            From a 9-1-1 center to tech support to building integrations and automation tools.
          </p>
        </Reveal>
        {experience.length === 0 ? (
          <p className="muted">Nothing here yet. Check back soon.</p>
        ) : (
          <Timeline jobs={experience} />
        )}
      </div>
    </section>
  )
}
