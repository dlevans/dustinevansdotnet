// Runs after `vite build`. Link-preview crawlers (Facebook, Discord, iMessage…)
// don't run JavaScript, so every shareable URL gets its own small HTML file in
// dist/ with its title, description, and image already filled in. The React app
// still loads from those files exactly as it does from the main index.html.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { profile, about, projects, photography, socials } from '../src/data/site.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const site = profile.siteUrl.replace(/\/$/, '')
const fullName = `${profile.firstName} ${profile.lastName}`

const role = profile.roleLines.join(' ').replace(/^an?\s+/i, '')
const sentence = role[0].toUpperCase() + role.slice(1)
const defaultDescription = `${sentence}. Based in ${profile.location}.`

const shorten = (text, max = 200) => {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}
const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── Images ──────────────────────────────────────────────────────────────
const projectPages = projects.filter((p) => p.slug)
const shareDir = path.join(dist, 'share')
fs.rmSync(shareDir, { recursive: true, force: true })

const job = {
  out: shareDir,
  card: {
    host: new URL(site).host,
    name: fullName,
    role: sentence,
    status: profile.status.open ? 'OPEN TO WORK' : 'NOT LOOKING',
    open: profile.status.open,
    coordinates: profile.coordinates,
    location: profile.location,
  },
  projects: projectPages.map((p) => ({
    key: `project:${p.slug}`,
    slug: p.slug,
    path: `/projects/${p.slug}`,
    kicker: p.archived ? 'archived project' : 'project',
    title: p.title,
    description: p.description,
    tags: p.tags,
    image: p.image || '',
  })),
}
const python = spawnSync('python', [path.join(root, 'scripts', 'build_share_images.py')], {
  input: JSON.stringify(job),
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
})
if (python.status !== 0) {
  console.error(python.stderr || python.error)
  process.exit(1)
}
const images = JSON.parse(python.stdout)

// Photo previews are made by process_photos.py and hosted on Cloudinary.
const missingPhotos = []
const photoImage = (photo) => {
  if (photo?.share?.startsWith('https://')) return photo.share
  missingPhotos.push(photo?.src)
  return images.card
}

// ── Pages ───────────────────────────────────────────────────────────────
const coverOf = (album) => album.photos.find((p) => p.thumb === album.cover) || album.photos[0]
const firstAlbum = photography.albums[0]

// ── Structured data & page text ─────────────────────────────────────────
const personId = `${site}/#person`
const pageUrl = (p) => `${site}${p === '/' ? '/' : `${p}/`}`
const imageUrl = (img) => (img.startsWith('https://') ? img : `${site}${encodeURI(img)}`)

function breadcrumbs(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'], ...trail].map(([name, p], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: pageUrl(p),
    })),
  }
}

// Apps (projects with `appCategory`) are marked as software; everything else as a creative work.
function projectJsonLd(p) {
  const base = {
    '@context': 'https://schema.org',
    name: p.title,
    description: p.seoDescription || p.description,
    url: pageUrl(`/projects/${p.slug}`),
    ...(p.image && { image: imageUrl(p.image) }),
    author: { '@type': 'Person', '@id': personId, name: fullName, url: `${site}/` },
    keywords: p.tags.join(', '),
  }
  if (!p.appCategory) return { ...base, '@type': 'CreativeWork' }
  return {
    ...base,
    '@type': p.playStore ? 'MobileApplication' : 'WebApplication',
    applicationCategory: p.appCategory,
    operatingSystem: p.playStore ? 'Android' : 'Any (web browser)',
    ...(p.playStore ? { installUrl: p.playStore } : p.link && { sameAs: p.link }),
  }
}

// Search engines read this HTML right away, without running JavaScript. React
// replaces it as soon as the app loads. Class names match the real page so it
// looks the same in the moment before that happens.
const linkHtml = (href, label, cls) =>
  `<a${cls ? ` class="${cls}"` : ''} href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)} ↗</a>`
const listHtml = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`
const tagsHtml = (tags) => `<ul class="tags">${tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`

function projectBody(p) {
  const links = [
    p.link && linkHtml(p.link, p.linkLabel ? `View on ${p.linkLabel}` : 'Check it out', 'btn'),
    p.repo && linkHtml(p.repo, 'View on GitHub', 'btn btn--ghost'),
    p.playStore && `<a class="project__store" href="${escapeHtml(p.playStore)}" target="_blank" rel="noreferrer"><img src="/badges/google-play.png" alt="Get it on Google Play" width="155" height="60" /></a>`,
  ].filter(Boolean)
  const sections = (p.details || []).map(({ heading, text, items, links: sectionLinks }) =>
    [
      `<h2>${escapeHtml(heading)}</h2>`,
      text && `<p>${escapeHtml(text)}</p>`,
      items && listHtml(items.map(escapeHtml)),
      sectionLinks && listHtml(sectionLinks.map(({ label, url }) => linkHtml(url, label))),
    ].filter(Boolean).join(''),
  )
  return [
    '<section class="section page"><div class="container"><div class="page__header">',
    '<a href="/projects/" class="page__back mono">← all projects</a>',
    `<p class="mono kicker">${p.archived ? 'archived project' : 'project'}</p>`,
    `<h1 class="page__title">${escapeHtml(p.title)}</h1>`,
    `<p class="section-lead">${escapeHtml(p.description)}</p>`,
    tagsHtml(p.tags),
    links.length ? `<div class="project__links">${links.join('')}</div>` : '',
    '</div>',
    p.image ? `<img class="project__image" src="${escapeHtml(p.image)}" alt="${escapeHtml(`${p.title} screenshot`)}" />` : '',
    `<div class="prose">${sections.join('')}</div>`,
    '</div></section>',
  ].join('')
}

function projectsBody() {
  const items = projects.map((p) => {
    const name = p.slug ? `<a href="/projects/${escapeHtml(p.slug)}/">${escapeHtml(p.title)}</a>` : escapeHtml(p.title)
    return `<strong>${name}</strong>: ${escapeHtml(p.description)}`
  })
  return [
    '<section class="section page"><div class="container"><div class="page__header">',
    '<a href="/" class="page__back mono">← back home</a>',
    `<h1 class="page__title">All projects</h1>`,
    `<p class="section-lead">Things ${escapeHtml(profile.firstName)} has built: software, electronics, props, and more.</p>`,
    '</div>',
    `<div class="prose">${listHtml(items)}</div>`,
    '</div></section>',
  ].join('')
}

const pages = [
  { path: '/', title: profile.seoTitle || fullName, heading: fullName, description: profile.seoDescription || defaultDescription, image: images.card, alt: `${fullName} business card` },
  {
    path: '/projects',
    title: `Projects · ${fullName}`,
    description: `Things ${profile.firstName} has built: software, electronics, props, and more.`,
    image: images.card,
    alt: `${fullName} business card`,
    body: projectsBody(),
    jsonLd: [breadcrumbs([['Projects', '/projects']])],
  },
  { path: '/privacy', title: `Privacy Policy · ${fullName}`, description: `Privacy policy for ${fullName}'s website and apps.`, image: images.card, alt: `${fullName} business card` },
  {
    path: '/photography',
    title: `Photography · ${fullName}`,
    description: photography.intro,
    image: firstAlbum ? photoImage(coverOf(firstAlbum)) : images.card,
    alt: `Photography by ${fullName}`,
  },
  ...projectPages.map((p) => ({
    path: `/projects/${p.slug}`,
    title: `${p.seoTitle || p.title} · ${fullName}`,
    description: p.seoDescription || p.description,
    image: images[`project:${p.slug}`],
    alt: `${p.title} project card`,
    body: projectBody(p),
    jsonLd: [projectJsonLd(p), breadcrumbs([['Projects', '/projects'], [p.title, `/projects/${p.slug}`]])],
  })),
  ...photography.albums.flatMap((album) => {
    const albumPath = `/photography/${album.slug}`
    const count = `${album.photos.length} ${album.photos.length === 1 ? 'photo' : 'photos'}`
    return [
      {
        path: albumPath,
        title: `${album.title} · Photography · ${fullName}`,
        description: album.description ? `${album.description} ${count} by ${fullName}.` : `${count} by ${fullName}.`,
        image: photoImage(coverOf(album)),
        alt: `${album.title} gallery`,
      },
      ...album.photos.map((photo) => ({
        path: `${albumPath}/${photo.name}`,
        title: `${photo.caption ? `${photo.caption} · ` : ''}${album.title} · Photography · ${fullName}`,
        description: `Photo by ${fullName}, from the ${album.title} gallery.`,
        image: photoImage(photo),
        alt: photo.alt,
      })),
    ]
  }),
]

// ── Structured data ─────────────────────────────────────────────────────
// Tells Google who the site is about, so searches for the name + city match.
function personJsonLd() {
  const [city, region] = profile.location.split(',').map((x) => x.trim())
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: fullName,
    url: `${site}/`,
    image: `${site}${images.card}`,
    jobTitle: profile.jobTitle,
    description: profile.seoDescription || defaultDescription,
    address: { '@type': 'PostalAddress', addressLocality: city, addressRegion: region, addressCountry: 'US' },
    knowsAbout: about.skills,
    sameAs: [...socials.map((s) => s.url).filter((u) => u.startsWith('https://')), photography.instagram].filter(Boolean),
  }
  return person
}

// ── HTML ────────────────────────────────────────────────────────────────
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

function render(page) {
  // Apache serves these folders with a trailing slash, so that's the real URL.
  const url = `${site}${page.path === '/' ? '/' : `${page.path}/`}`
  const title = escapeHtml(page.title)
  const description = escapeHtml(shorten(page.description))
  const image = escapeHtml(page.image.startsWith('https://') ? page.image : `${site}${encodeURI(page.image)}`)
  const alt = escapeHtml(page.alt)
  const tags = [
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(fullName)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${alt}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
  const jsonLd = page.path === '/' ? [personJsonLd()] : page.jsonLd || []
  // Escape "<" so nothing in the data can close the <script> tag early.
  for (const data of jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  return template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${description}" />`)
    .replace('</head>', () => `    ${tags.join('\n    ')}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${page.body || ''}</div>`)
}

for (const page of pages) {
  const dir = path.join(dist, ...page.path.split('/').filter(Boolean))
  fs.mkdirSync(dir, { recursive: true })
  // Render rewrites (/projects/:slug → /projects/:slug/index.html, etc.) serve
  // these for URLs without a trailing slash too.
  fs.writeFileSync(path.join(dir, 'index.html'), render(page))
}

// ── Sitemap & robots.txt ────────────────────────────────────────────────
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map((page) => `  <url><loc>${escapeHtml(pageUrl(page.path))}</loc></url>`),
  '</urlset>',
  '',
].join('\n')
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`)

console.log(`Link previews: ${pages.length} pages, ${Object.keys(images).length} images in dist/share/`)
if (missingPhotos.length) {
  console.warn(`Warning: ${missingPhotos.length} photos have no Cloudinary preview image. Run: npm run photos (with keys in .env)`)
}
