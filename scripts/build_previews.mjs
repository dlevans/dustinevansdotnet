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

const pages = [
  { path: '/', title: profile.seoTitle || fullName, heading: fullName, description: profile.seoDescription || defaultDescription, image: images.card, alt: `${fullName} business card` },
  { path: '/projects', title: `Projects · ${fullName}`, description: `Things ${profile.firstName} has built: software, electronics, props, and more.`, image: images.card, alt: `${fullName} business card` },
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
    title: `${p.title} · ${fullName}`,
    description: p.description,
    image: images[`project:${p.slug}`],
    alt: `${p.title} project card`,
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
    name: fullName,
    url: `${site}/`,
    image: `${site}${images.card}`,
    jobTitle: profile.jobTitle,
    description: profile.seoDescription || defaultDescription,
    address: { '@type': 'PostalAddress', addressLocality: city, addressRegion: region, addressCountry: 'US' },
    knowsAbout: about.skills,
    sameAs: [...socials.map((s) => s.url).filter((u) => u.startsWith('https://')), photography.instagram].filter(Boolean),
  }
  // Escape "<" so nothing in the data can close the <script> tag early.
  return JSON.stringify(person).replace(/</g, '\\u003c')
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
  if (page.path === '/') tags.push(`<script type="application/ld+json">${personJsonLd()}</script>`)
  return template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${description}" />`)
    .replace('</head>', () => `    ${tags.join('\n    ')}\n  </head>`)
}

for (const page of pages) {
  const dir = path.join(dist, ...page.path.split('/').filter(Boolean))
  fs.mkdirSync(dir, { recursive: true })
  // Render rewrites (/projects/:slug → /projects/:slug/index.html, etc.) serve
  // these for URLs without a trailing slash too.
  fs.writeFileSync(path.join(dir, 'index.html'), render(page))
}

// ── Sitemap & robots.txt ────────────────────────────────────────────────
const urlOf = (p) => `${site}${p === '/' ? '/' : `${p}/`}`
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map((page) => `  <url><loc>${escapeHtml(urlOf(page.path))}</loc></url>`),
  '</urlset>',
  '',
].join('\n')
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`)

console.log(`Link previews: ${pages.length} pages, ${Object.keys(images).length} images in dist/share/`)
if (missingPhotos.length) {
  console.warn(`Warning: ${missingPhotos.length} photos have no Cloudinary preview image. Run: npm run photos (with keys in .env)`)
}
