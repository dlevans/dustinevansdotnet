import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Searchable command palette (Ctrl/⌘+K or "/"). Mount it only while open.
 * groups: [{ heading, items: [{ id, label, icon, hint, keywords, run }] }]
 */
export default function CommandPalette({ onClose, groups }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return groups
      .map((g) => ({
        ...g,
        items: q
          ? g.items.filter((it) =>
              `${it.label} ${it.keywords || ''} ${g.heading}`.toLowerCase().includes(q),
            )
          : g.items,
      }))
      .filter((g) => g.items.length)
  }, [groups, query])

  const flat = useMemo(() => filtered.flatMap((g) => g.items), [filtered])
  const indexOf = useMemo(() => new Map(flat.map((it, i) => [it.id, i])), [flat])

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 20)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = (item) => {
    onClose()
    // let the dialog close before effects start
    setTimeout(() => item.run(), 60)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flat[active]) run(flat[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div className="cmdk-overlay" onMouseDown={onClose}>
      <div
        className="cmdk"
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="cmdk__search">
          <span aria-hidden className="cmdk__icon">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder="Search pages, projects, or fun stuff…"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={flat[active] ? `cmdk-${flat[active].id}` : undefined}
          />
          <kbd className="cmdk__esc">Esc</kbd>
        </div>
        <div className="cmdk__list" id="cmdk-list" role="listbox" ref={listRef}>
          {flat.length === 0 && <p className="cmdk__empty">No results for “{query}”. Try “confetti” 🎉</p>}
          {filtered.map((g) => (
            <div key={g.heading} className="cmdk__group" role="group" aria-label={g.heading}>
              <p className="cmdk__heading mono">{g.heading}</p>
              {g.items.map((it) => {
                const i = indexOf.get(it.id)
                return (
                  <button
                    type="button"
                    key={it.id}
                    id={`cmdk-${it.id}`}
                    data-index={i}
                    role="option"
                    aria-selected={i === active}
                    className={`cmdk__item ${i === active ? 'is-active' : ''}`}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(it)}
                  >
                    <span className="cmdk__item-icon" aria-hidden>{it.icon}</span>
                    <span className="cmdk__item-label">{it.label}</span>
                    {it.hint && <span className="cmdk__hint mono">{it.hint}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="cmdk__footer mono">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>Ctrl</kbd><kbd>K</kbd> toggle</span>
        </div>
      </div>
    </div>
  )
}
