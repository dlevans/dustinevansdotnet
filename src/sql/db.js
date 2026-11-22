/*
 * Runs Postgres in the browser with PGlite (https://pglite.dev).
 *
 * Every visitor gets their own in-memory copy of the database, so nothing they run
 * can affect anyone else, and reloading the page (or "Reset database") starts fresh.
 * PGlite is large (~3 MB compressed), so it's only downloaded when a SQL page opens one.
 */
import { databases } from '../data/sqlTutorials'

const MAX_ROWS = 500

/** Load a database by name (see `databases` in src/data/sqlTutorials.js). */
export async function openDatabase(name) {
  const info = databases.find((d) => d.name === name)
  if (!info) throw new Error(`Unknown database "${name}"`)
  const [{ PGlite }, script] = await Promise.all([
    import('@electric-sql/pglite'),
    fetch(info.file).then((r) => {
      if (!r.ok) throw new Error(`Couldn't load ${info.file} (${r.status})`)
      return r.text()
    }),
  ])
  const pg = await PGlite.create()
  await pg.exec(script)
  return pg
}

/**
 * Run one or more statements. Returns a list of results, one per statement:
 * { columns, rows (arrays), total, command, rowCount }.
 */
export async function runSql(pg, sql) {
  const results = await pg.exec(sql, { rowMode: 'array' })
  return results.map((r) => ({
    columns: r.fields.map((f) => f.name),
    rows: r.rows.slice(0, MAX_ROWS),
    total: r.rows.length,
    command: r.command,
    rowCount: r.rowCount ?? r.affectedRows,
    hasColumns: r.fields.length > 0,
  }))
}

/** Tables and their columns, for the schema panel. */
export async function describeSchema(pg) {
  const { rows } = await pg.query(
    `SELECT c.table_name, c.column_name, c.data_type
       FROM information_schema.columns c
       JOIN information_schema.tables t
         ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
      ORDER BY c.table_name, c.ordinal_position`,
  )
  const tables = new Map()
  for (const { table_name, column_name, data_type } of rows) {
    if (!tables.has(table_name)) tables.set(table_name, [])
    tables.get(table_name).push({ name: column_name, type: data_type })
  }
  return [...tables].map(([name, columns]) => ({ name, columns }))
}

/** Turn a cell into display text. */
export function formatCell(v) {
  if (v === null || v === undefined) return 'NULL'
  if (v instanceof Date) {
    // date columns come back as midnight UTC; show them without a time
    const iso = v.toISOString()
    return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso.replace('T', ' ').replace(/\.000Z$/, 'Z')
  }
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

/** True if two result sets hold the same rows (order matters only if `ordered`). */
export function sameRows(a, b, ordered) {
  if (!a || !b || a.total !== b.total || a.columns.length !== b.columns.length) return false
  const key = (row) => JSON.stringify(row.map(formatCell))
  const ka = a.rows.map(key)
  const kb = b.rows.map(key)
  if (!ordered) {
    ka.sort()
    kb.sort()
  }
  return ka.every((k, i) => k === kb[i])
}
