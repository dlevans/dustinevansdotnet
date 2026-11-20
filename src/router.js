import { useSyncExternalStore } from 'react'

// Tiny client-side router: no dependencies, works with real URLs like /projects.
// (The host needs a rewrite of /* to /index.html so refreshing /projects works.)

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

/**
 * Page URLs end in "/" (/projects/itable/). Each shareable page is built as
 * <path>/index.html with its own link-preview tags, and the host only finds
 * that file when the URL has the trailing slash. Without it, Facebook etc. get
 * the home page's preview.
 */
export const withSlash = (p) => (p.endsWith('/') || /\.[a-z0-9]+$/i.test(p) ? p : `${p}/`)

if (typeof window !== 'undefined') {
  const { pathname, search, hash } = window.location
  if (withSlash(pathname) !== pathname) window.history.replaceState({}, '', withSlash(pathname) + search + hash)
}

/** Navigate to a path like '/projects' or '/#about'. `replace` skips adding a history entry. */
export function navigate(to, { replace = false } = {}) {
  const url = new URL(to, window.location.href)
  url.pathname = withSlash(url.pathname)
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
