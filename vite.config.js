import fs from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

// Serve ./photos at /photos during `npm run dev` and `npm run preview`.
// The folder is NOT copied into dist/ — upload it to DreamHost separately
// (dustinevans.net/photos/), so deploys don't re-upload every photo.
function servePhotos() {
  const dir = path.join(root, 'photos')
  const types = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  }
  const handler = (req, res, next) => {
    if (!req.url?.startsWith('/photos/')) return next()
    let rel
    try {
      rel = decodeURIComponent(req.url.split('?')[0].slice('/photos/'.length))
    } catch {
      return next()
    }
    const file = path.join(dir, rel)
    if (!file.startsWith(dir + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
    res.setHeader('Content-Type', types[path.extname(file).toLowerCase()] || 'application/octet-stream')
    fs.createReadStream(file).pipe(res)
  }
  return {
    name: 'serve-photos',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// While `npm run dev` is running, watch photos-originals/ and re-run
// scripts/process_photos.py whenever images or folders are added, changed,
// or removed. The page reloads with the new galleries automatically.
function autoProcessPhotos() {
  const srcDir = path.join(root, 'photos-originals')
  let timer
  let running = false
  let again = false
  const run = (logger) => {
    if (running) {
      again = true
      return
    }
    running = true
    const child = spawn('python', ['scripts/process_photos.py'], { cwd: root, stdio: 'inherit' })
    child.on('error', (e) => {
      running = false
      logger.warn(`[photos] couldn't run python: ${e.message}`)
    })
    child.on('close', () => {
      running = false
      if (again) {
        again = false
        run(logger)
      }
    })
  }
  return {
    name: 'auto-process-photos',
    apply: 'serve',
    configureServer(server) {
      const logger = server.config.logger
      server.watcher.add(srcDir)
      const onChange = (file) => {
        if (!path.resolve(file).startsWith(srcDir + path.sep)) return
        clearTimeout(timer)
        timer = setTimeout(() => run(logger), 1500) // wait for copies to finish
      }
      for (const ev of ['add', 'change', 'unlink', 'addDir', 'unlinkDir']) server.watcher.on(ev, onChange)
      run(logger) // catch anything added while the dev server was off
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    servePhotos(),
    autoProcessPhotos(),
  ],
})
