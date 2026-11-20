import { useSyncExternalStore } from 'react'

// Tiny client-side router: no dependencies, works with real URLs like /projects.
// (DreamHost needs public/.htaccess so refreshing /projects serves index.html.)

const listeners = new Set()
const notify = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') window.addEventListener('popstate', notify)

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const snapshot = () => window.location.pathname + window.location.hash

/** Returns { path, hash } and re-renders on navigation. */
export function useLocation() {
  const loc = useSyncExternalStore(subscribe, snapshot, () => '/')
  const i = loc.indexOf('#')
  return i === -1 ? { path: loc, hash: '' } : { path: loc.slice(0, i), hash: loc.slice(i) }
}

/** Navigate to a path like '/projects' or '/#about'. `replace` skips adding a history entry. */
export function navigate(to, { replace = false } = {}) {
  const url = new URL(to, window.location.href)
  const samePage = url.pathname === window.location.pathname
  if (url.pathname + url.hash !== snapshot()) {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url.pathname + url.hash)
  }
  if (samePage && url.hash) {
    document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' })
  }
  notify()
}

/** Normalize trailing slashes so /projects/ === /projects */
export const cleanPath = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p)
