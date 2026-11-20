import { useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { profile, projects, experience, socials, photography } from './data/site'
import { useLocation, navigate, cleanPath } from './router'
import Link from './components/Link'
import Starfield from './fx/Starfield'
import useKonami from './fx/useKonami'
import CommandPalette from './fx/CommandPalette'
import { iconFor } from './icons'
import { confettiBurst, confettiCannons, fireworks, emojiRain } from './fx/celebrate'
import Home from './pages/Home'
import ProjectsPage from './pages/ProjectsPage'
import PhotographyPage from './pages/PhotographyPage'
import NotFound from './pages/NotFound'
import PrivacyPage from './pages/PrivacyPage'
import AlbumPage from './pages/AlbumPage'
import ProjectPage from './pages/ProjectPage'

const fullName = `${profile.firstName} ${profile.lastName}`

const routes = {
  '/': { page: Home, title: fullName },
  '/projects': { page: ProjectsPage, title: `Projects · ${fullName}` },
  '/photography': { page: PhotographyPage, title: `Photography · ${fullName}` },
  '/privacy': { page: PrivacyPage, title: `Privacy Policy · ${fullName}` },
}

/** Find the page for a path, including /projects/<slug> and /photography/<album> pages. */
function resolve(path) {
  if (routes[path]) return routes[path]
  const projectMatch = path.match(/^\/projects\/([^/]+)$/)
  const project = projectMatch && projects.find((p) => p.slug === projectMatch[1])
  if (project) {
    return { page: ProjectPage, props: { project }, title: `${project.title} · Projects · ${fullName}` }
  }
  const m = path.match(/^\/photography\/([^/]+)(?:\/([^/]+))?$/)
  const album = m && photography.albums.find((a) => a.slug === m[1])
  const photo = album && m[2] && album.photos.find((p) => p.name === m[2])
  if (album && (!m[2] || photo)) {
    return {
      page: AlbumPage,
      key: `/photography/${album.slug}`, // opening a photo stays on the same page
      props: { album, photoName: photo?.name },
      title: `${photo?.caption ? `${photo.caption} · ` : ''}${album.title} · Photography · ${fullName}`,
    }
  }
  return null
}

const isCurrent = (to, path) => to === path || (!to.includes('#') && to !== '/' && path.startsWith(to + '/'))

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function Nav({ onSearch, path }) {
  const [open, setOpen] = useState(false)
  const links = [
    ['About', '/#about'],
    ['Projects', '/projects'],
    photography.albums.length ? ['Photography', '/photography'] : null,
    experience.length ? ['Experience', '/#experience'] : null,
    ['Contact', '/#contact'],
  ].filter(Boolean)
  return (
    <header className="nav">
      <Link to="/#top" className="nav__logo" aria-label="Home">
        {profile.firstName[0]}
        {profile.lastName[0]}
        <span className="dot">.</span>
      </Link>
      <button type="button" className="nav__search" onClick={onSearch} aria-label="Search (Ctrl+K)">
        <span aria-hidden>⌕</span>
        <span className="nav__search-text">Search…</span>
        <kbd className="nav__search-kbd">{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <button
        className="nav__toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>
      <nav className={`nav__links ${open ? 'is-open' : ''}`}>
        {links.map(([label, to]) => (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={isCurrent(to, path) ? 'is-current' : undefined}
            aria-current={isCurrent(to, path) ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
        {profile.resumeUrl && (
          <a className="btn btn--small" href={profile.resumeUrl} target="_blank" rel="noreferrer">
            Résumé
          </a>
        )}
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>
          © {new Date().getFullYear()} {fullName}
        </span>
        <Link to="/privacy" className="footer__link">Privacy Policy</Link>
      </div>
    </footer>
  )
}

const go = (to) => () => navigate(to)
const openUrl = (url) => () =>
  url.startsWith('mailto') ? (window.location.href = url) : window.open(url, '_blank', 'noopener')

function flipPage() {
  document.documentElement.classList.add('is-flipped')
  setTimeout(() => document.documentElement.classList.remove('is-flipped'), 3000)
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [starsOn, setStarsOn] = useState(true)
  const { path: rawPath, hash } = useLocation()
  const path = cleanPath(rawPath)
  const route = resolve(path)
  const Page = route?.page || NotFound
  const pageKey = route?.key || path
  const pageTitle = route?.title || `Not found · ${fullName}`

  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  // Scroll position when the page changes
  const prevPage = useRef(pageKey)
  useEffect(() => {
    if (prevPage.current === pageKey) {
      // first load with a hash (e.g. /#contact): jump to it once rendered
      if (hash) requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView())
      return
    }
    prevPage.current = pageKey
    if (hash) requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView())
    else window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey])

  const unlock = useCallback(() => {
    fireworks(5000)
    emojiRain('🎮', 2500)
  }, [])
  useKonami(unlock)

  // Ctrl/⌘+K or "/" opens the palette
  useEffect(() => {
    const onKey = (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      } else if (e.key === '/' && !typing) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const meteors = () => {
    setStarsOn(true)
    setTimeout(() => window.dispatchEvent(new Event('fx:meteors')), 50)
  }

  const groups = [
    {
      heading: 'Navigate',
      items: [
        { id: 'home', icon: '🏠', label: 'Home', run: go('/#top') },
        { id: 'about', icon: '👋', label: 'About me', keywords: 'bio skills', run: go('/#about') },
        { id: 'work', icon: '🧰', label: 'All projects', keywords: 'work showcase crafts portfolio', run: go('/projects') },
        photography.albums.length && { id: 'photos', icon: '📷', label: 'Photography', keywords: 'photos gallery pictures camera', run: go('/photography') },
        experience.length && { id: 'exp', icon: '💼', label: 'Experience', keywords: 'jobs career resume', run: go('/#experience') },
        { id: 'contact', icon: '✉️', label: 'Contact', keywords: 'email connect', run: go('/#contact') },
        { id: 'privacy', icon: '🔒', label: 'Privacy Policy', keywords: 'legal android apps data', run: go('/privacy') },
        profile.resumeUrl && { id: 'resume', icon: '📄', label: 'Résumé', keywords: 'cv pdf', run: openUrl(profile.resumeUrl) },
      ].filter(Boolean),
    },
    {
      heading: 'Projects',
      items: projects.map((p, i) => ({
        id: `proj-${i}`,
        icon: '📁',
        label: p.title,
        keywords: [...p.tags, ...(p.archived ? ['archived'] : [])].join(' '),
        hint: p.slug ? '' : p.link ? `${(p.linkLabel || 'live').toLowerCase()} ↗` : p.repo ? 'code ↗' : '',
        run: p.slug ? go(`/projects/${p.slug}`) : p.link || p.repo ? openUrl(p.link || p.repo) : go('/projects'),
      })),
    },
    {
      heading: 'Photo galleries',
      items: photography.albums.map((a) => ({
        id: `album-${a.slug}`,
        icon: a.icon || '📷',
        label: a.title,
        keywords: `photography photos gallery ${a.description}`,
        hint: a.photos.length ? `${a.photos.length}` : '',
        run: go(`/photography/${a.slug}`),
      })),
    },
    {
      heading: 'Links',
      items: socials.map((s) => ({
        id: `social-${s.label}`,
        icon: <FontAwesomeIcon icon={iconFor(s.icon)} />,
        label: s.label,
        hint: '↗',
        run: openUrl(s.url),
      })),
    },
    {
      heading: 'Fun stuff',
      items: [
        { id: 'confetti', icon: '🎉', label: 'Confetti', keywords: 'party celebrate', run: () => confettiBurst({ x: 0.5, y: 0.5 }) },
        { id: 'cannons', icon: '🎊', label: 'Confetti cannons', keywords: 'party celebrate', run: () => confettiCannons(2500) },
        { id: 'fireworks', icon: '🎆', label: 'Fireworks', keywords: 'party celebrate boom', run: () => fireworks() },
        { id: 'meteors', icon: '🌠', label: 'Meteor shower', keywords: 'shooting stars space', run: meteors },
        { id: 'swords', icon: '⚔️', label: 'Sword rain', keywords: 'emoji ren faire cosplay', run: () => emojiRain('⚔️') },
        { id: 'games', icon: '🎮', label: 'Controller rain', keywords: 'emoji games', run: () => emojiRain('🎮') },
        { id: 'hearts', icon: '❤️', label: 'Heart rain', keywords: 'emoji love', run: () => emojiRain('❤️') },
        { id: 'flip', icon: '🙃', label: 'Flip the page', keywords: 'upside down rotate', run: flipPage },
        {
          id: 'party',
          icon: '🪩',
          label: 'Party mode (everything!)',
          keywords: 'all chaos',
          run: () => {
            meteors()
            confettiCannons(2500)
            fireworks(4500)
            setTimeout(() => emojiRain('🎉', 2500), 800)
          },
        },
        {
          id: 'stars',
          icon: '✨',
          label: starsOn ? 'Turn off starfield' : 'Turn on starfield',
          keywords: 'background toggle',
          run: () => setStarsOn((v) => !v),
        },
      ],
    },
  ]

  return (
    <>
      {starsOn && <Starfield />}
      <Nav onSearch={() => setPaletteOpen(true)} path={path} />
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} groups={groups} />}
      <main>
        <Page key={pageKey} {...route?.props} />
      </main>
      <Footer />
    </>
  )
}
