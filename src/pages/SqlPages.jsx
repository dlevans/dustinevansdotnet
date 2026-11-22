import { useState } from 'react'
import { Reveal } from '../components/Reveal'
import Link from '../components/Link'
import SqlRunner, { DatabaseBar } from '../components/SqlRunner'
import useDatabase from '../sql/useDatabase'
import { sqlTutorials, databases } from '../data/sqlTutorials'

/** Text with `inline code` in backticks. */
function Rich({ text }) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  )
}

const dbTitle = (name) => databases.find((d) => d.name === name)?.title || name

export function SqlIndexPage() {
  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/" className="page__back mono">← back home</Link>
          <p className="mono kicker">learn sql</p>
          <h1 className="page__title">
            SQL <span className="gradient-text">tutorials</span>
          </h1>
          <p className="section-lead">
            Hands-on lessons with a real Postgres database running right in your browser. Edit the queries, run
            them, and check your answers. Nothing to install, and you can't break anything: reload the page and
            the data starts fresh.
          </p>
        </Reveal>

        <div className="sqllist">
          {sqlTutorials.map((t, i) => (
            <Reveal key={t.slug} delay={i * 60}>
              <Link to={`/sql/${t.slug}`} className="sqllist__card">
                <span className="mono sqllist__meta">
                  {String(i + 1).padStart(2, '0')} · {t.level}
                </span>
                <h2>{t.title}</h2>
                <p>{t.description}</p>
                <span className="sqllist__go mono">start →</span>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={sqlTutorials.length * 60}>
            <Link to="/sql/playground" className="sqllist__card sqllist__card--play">
              <span className="mono sqllist__meta">free play</span>
              <h2>SQL playground</h2>
              <p>An empty editor and the sample databases. Write any query you like.</p>
              <span className="sqllist__go mono">open →</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function SqlTutorialPage({ tutorial }) {
  const db = useDatabase(tutorial.database)
  const index = sqlTutorials.indexOf(tutorial)
  const next = sqlTutorials[index + 1]
  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/sql" className="page__back mono">← all sql tutorials</Link>
          <p className="mono kicker">sql tutorial · {tutorial.level}</p>
          <h1 className="page__title">{tutorial.title}</h1>
          <p className="section-lead">{tutorial.description}</p>
        </Reveal>

        <DatabaseBar db={db} title={dbTitle(tutorial.database)} />

        <div className="prose sqlsteps">
          {tutorial.steps.map((step, i) => (
            <div key={i} className="sqlstep">
              <h2>{step.heading}</h2>
              {step.text?.map((p, j) => (
                <p key={j}>
                  <Rich text={p} />
                </p>
              ))}
              {step.query != null && (
                <SqlRunner db={db} query={step.query} solution={step.solution} ordered={step.ordered} task={step.task} />
              )}
            </div>
          ))}
        </div>

        <div className="sqlnext">
          {next ? (
            <Link to={`/sql/${next.slug}`} className="btn">
              Next: {next.title} →
            </Link>
          ) : (
            <Link to="/sql/playground" className="btn">
              Try the playground →
            </Link>
          )}
          <Link to="/sql" className="btn btn--ghost">All tutorials</Link>
        </div>
      </div>
    </section>
  )
}

function Playground({ name }) {
  const db = useDatabase(name)
  return (
    <>
      <DatabaseBar db={db} title={dbTitle(name)} />
      <SqlRunner db={db} query={'SELECT *\nFROM customers\nLIMIT 10;'} />
    </>
  )
}

export function SqlPlaygroundPage() {
  const [name, setName] = useState(databases[0].name)
  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/sql" className="page__back mono">← all sql tutorials</Link>
          <p className="mono kicker">sql playground</p>
          <h1 className="page__title">Playground</h1>
          <p className="section-lead">
            A real Postgres database in your browser. Write any SQL you like, including <code>CREATE</code>,{' '}
            <code>INSERT</code>, and <code>UPDATE</code>. Reset the database to start over.
          </p>
          {databases.length > 1 && (
            <label className="sqlpick mono">
              Database{' '}
              <select value={name} onChange={(e) => setName(e.target.value)}>
                {databases.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
          )}
        </Reveal>
        <Playground key={name} name={name} />
      </div>
    </section>
  )
}
