import { useState } from 'react'
import { runSql, sameRows, formatCell } from '../sql/db'

const SCHEMA_CHANGE = /\b(create|drop|alter|rename)\b/i

/** Status line, schema browser, and reset button for a page's database. */
export function DatabaseBar({ db, title }) {
  const tableCount = db.schema.length
  return (
    <div className="sqlbar">
      <div className="sqlbar__row">
        <span className={`sqlbar__status is-${db.status}`}>
          <span className="sqlbar__dot" aria-hidden />
          {db.status === 'loading' && 'Starting Postgres in your browser…'}
          {db.status === 'ready' && `${title} database ready · Postgres`}
          {db.status === 'error' && `Couldn't start the database: ${db.error}`}
        </span>
        <button type="button" className="btn btn--ghost btn--small" onClick={db.reset} disabled={db.status === 'loading'}>
          Reset database
        </button>
      </div>
      {tableCount > 0 && (
        <details className="sqlbar__schema">
          <summary>
            Tables ({tableCount})
          </summary>
          <div className="sqlbar__tables">
            {db.schema.map((t) => (
              <div key={t.name} className="sqlbar__table">
                <strong className="mono">{t.name}</strong>
                <ul>
                  {t.columns.map((c) => (
                    <li key={c.name} className="mono">
                      {c.name} <span className="muted">{c.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function ResultTable({ result }) {
  if (!result.hasColumns) {
    return (
      <p className="sqlresult__note mono">
        {result.command || 'OK'}
        {result.rowCount != null &&
          /^(INSERT|UPDATE|DELETE|MERGE)$/i.test(result.command || '') &&
          ` · ${result.rowCount} ${result.rowCount === 1 ? 'row' : 'rows'}`}
      </p>
    )
  }
  return (
    <div className="sqlresult">
      <div className="sqlresult__scroll">
        <table>
          <thead>
            <tr>
              {result.columns.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, r) => (
              <tr key={r}>
                {row.map((v, i) => (
                  <td key={i} className={v === null ? 'is-null' : typeof v === 'number' ? 'is-num' : undefined}>
                    {formatCell(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sqlresult__note mono">
        {result.total === 0
          ? 'No rows'
          : result.total > result.rows.length
            ? `Showing ${result.rows.length} of ${result.total} rows`
            : `${result.total} ${result.total === 1 ? 'row' : 'rows'}`}
      </p>
    </div>
  )
}

/** Last result that returned columns (what "Check my answer" compares). */
const lastTable = (results) => [...results].reverse().find((r) => r.hasColumns)

/** An editable SQL box with Run, results, and (if a solution is given) answer checking. */
export default function SqlRunner({ db, query = '', solution, ordered = false, task }) {
  const [sql, setSql] = useState(query)
  const [out, setOut] = useState(null) // { version, results?, error?, ms, verdict? }
  const [busy, setBusy] = useState(false)
  const ready = db.status === 'ready'
  const shown = out && out.version === db.version ? out : null

  async function execute(check) {
    if (!ready || busy) return
    setBusy(true)
    const started = performance.now()
    const version = db.version
    try {
      const results = await runSql(db.pg, sql)
      let verdict
      if (check) {
        // Run the solution in a transaction that's rolled back, so it can't change anything
        await db.pg.exec('BEGIN')
        try {
          const expected = lastTable(await runSql(db.pg, solution))
          verdict = sameRows(lastTable(results), expected, ordered) ? 'right' : 'wrong'
        } finally {
          await db.pg.exec('ROLLBACK')
        }
      }
      setOut({ version, results, ms: performance.now() - started, verdict })
      if (SCHEMA_CHANGE.test(sql)) db.refreshSchema()
    } catch (e) {
      setOut({ version, error: e.message || String(e), position: e.position, ms: performance.now() - started })
    } finally {
      setBusy(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      execute(false)
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const el = e.currentTarget
      const { selectionStart: s, selectionEnd: end } = el
      const next = sql.slice(0, s) + '  ' + sql.slice(end)
      setSql(next)
      requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2))
    }
  }

  const rows = Math.max(3, sql.split('\n').length + 1)

  return (
    <div className="sqlrunner">
      {task && (
        <p className="sqlrunner__task">
          <span className="mono">exercise</span> {task}
        </p>
      )}
      <textarea
        className="sqlrunner__editor mono"
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={onKeyDown}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="SQL query"
      />
      <div className="sqlrunner__actions">
        <button type="button" className="btn btn--small" onClick={() => execute(false)} disabled={!ready || busy}>
          {busy ? 'Running…' : 'Run ▶'}
        </button>
        {solution && (
          <>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => execute(true)} disabled={!ready || busy}>
              Check my answer
            </button>
            <button type="button" className="sqlrunner__link" onClick={() => setSql(solution)}>
              Show solution
            </button>
          </>
        )}
        {sql !== query && (
          <button type="button" className="sqlrunner__link" onClick={() => setSql(query)}>
            Undo my changes
          </button>
        )}
        <span className="sqlrunner__hint mono">Ctrl+Enter to run</span>
      </div>

      {shown?.verdict === 'right' && <p className="sqlrunner__verdict is-right">✓ Correct! Nice work.</p>}
      {shown?.verdict === 'wrong' && (
        <p className="sqlrunner__verdict is-wrong">Not quite. Your results don't match the expected answer yet.</p>
      )}
      {shown?.error && (
        <pre className="sqlrunner__error mono">ERROR: {shown.error}</pre>
      )}
      {shown?.results?.map((r, i) => <ResultTable key={i} result={r} />)}
      {shown && <p className="sqlrunner__time mono">{shown.ms.toFixed(0)} ms</p>}
    </div>
  )
}
