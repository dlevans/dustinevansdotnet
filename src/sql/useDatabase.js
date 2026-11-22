import { useCallback, useEffect, useRef, useState } from 'react'
import { openDatabase, describeSchema } from './db'

/**
 * Loads a database (by name) once the page is in the browser.
 * Returns { status: 'loading' | 'ready' | 'error', pg, schema, error, version, reset, refreshSchema }.
 * `version` goes up on every reset, so editors can drop results from the old copy.
 */
export default function useDatabase(name) {
  const [state, setState] = useState({ status: 'loading', pg: null, schema: [], error: null, version: 0 })
  const current = useRef(null) // the open PGlite instance
  const generation = useRef(0) // bumps on every load/unmount; stale loads close themselves

  const load = useCallback(
    async (version) => {
      const mine = ++generation.current
      try {
        const pg = await openDatabase(name)
        const schema = await describeSchema(pg)
        if (mine !== generation.current) {
          pg.close().catch(() => {})
          return
        }
        current.current?.close().catch(() => {})
        current.current = pg
        setState({ status: 'ready', pg, schema, error: null, version })
      } catch (e) {
        if (mine === generation.current) setState((s) => ({ ...s, status: 'error', error: e.message || String(e) }))
      }
    },
    [name],
  )

  useEffect(() => {
    const gen = generation // a counter, not a DOM node
    const open = current
    load(0)
    return () => {
      gen.current++
      open.current?.close().catch(() => {})
      open.current = null
    }
  }, [load])

  const reset = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    load(state.version + 1)
  }, [load, state.version])

  // After a CREATE/DROP/ALTER, re-read the table list
  const refreshSchema = useCallback(async () => {
    const pg = current.current
    if (!pg) return
    try {
      const schema = await describeSchema(pg)
      setState((s) => (s.pg === pg ? { ...s, schema } : s))
    } catch {
      /* ignore */
    }
  }, [])

  return { ...state, reset, refreshSchema }
}
