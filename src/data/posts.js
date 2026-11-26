// ─────────────────────────────────────────────────────────────
//  Blog posts are Markdown files in src/posts/. No database needed:
//  each file becomes a page at /blog/<file-name>/ when the site builds.
//
//  To write a post, add a file like src/posts/my-new-post.md:
//
//    ---
//    title: My new post
//    date: 2026-11-25
//    description: One or two lines shown in the post list and in Google.
//    tags: ESP32, 3D printing
//    image: /blog/my-new-post.webp      (optional; put images in /public/blog/)
//    draft: true                        (optional; only shows while running `npm run dev`)
//    ---
//
//    Write the post here in Markdown: ## headings, **bold**, [links](https://…),
//    ![images](/blog/photo.webp), lists, `code`, and ``` code blocks ```.
//
//  The file name is the URL, so use lowercase words with dashes.
// ─────────────────────────────────────────────────────────────

import { marked } from 'marked'

const files = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true })

// Drafts show while running `npm run dev`, but never in the built site.
const showDrafts = import.meta.env.DEV && typeof window !== 'undefined' && !window.__PRERENDER__

const unquote = (v) => v.replace(/^(['"])(.*)\1$/, '$2')

function parse(file, raw) {
  const slug = file.split('/').pop().replace(/\.md$/, '')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  const meta = {}
  for (const line of (m ? m[1] : '').split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = unquote(line.slice(i + 1).trim())
  }
  const body = m ? m[2] : raw
  const words = body.split(/\s+/).filter(Boolean).length
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    description: meta.description || '',
    image: meta.image || '',
    tags: meta.tags ? meta.tags.replace(/^\[|\]$/g, '').split(',').map((t) => unquote(t.trim())).filter(Boolean) : [],
    draft: meta.draft === 'true',
    minutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(body, { async: false }),
  }
}

export const posts = Object.entries(files)
  .map(([file, raw]) => parse(file, raw))
  .filter((p) => showDrafts || !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
