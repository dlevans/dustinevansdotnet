/*
 * Asteroids easter egg: the page itself becomes the asteroid field.
 *
 * Every big block on the page (nav bar, each section, footer) is a rock. Shooting a rock
 * enough times cracks it open: its own background/border vanishes and its child elements
 * scatter as smaller rocks. Rocks with nothing left inside explode. Clear the page to win.
 *
 * Controls: ← → turn, ↑ thrust, Space fire, Esc quit (WASD works too). On touch screens,
 * hold a finger on the screen and the ship flies toward it, firing.
 * Flying off the top or bottom of the screen scrolls the page.
 */

const LEAF_TAGS = new Set(['IMG', 'SVG', 'VIDEO', 'CANVAS', 'PICTURE', 'INPUT', 'TEXTAREA', 'SELECT', 'KBD', 'BR', 'HR', 'IFRAME'])
const MEDIA = 'img, svg, video, canvas, picture, iframe'
const TAU = Math.PI * 2
const rand = (a, b) => Math.random() * (b - a) + a

let running = null

export const asteroidsRunning = () => !!running

/** Start the game. Returns false if it's already running. `onClear` runs when every rock is gone. */
export function startAsteroids({ onClear } = {}) {
  if (running) return false
  running = createGame(onClear)
  return true
}

function isVisible(el) {
  const r = el.getBoundingClientRect()
  if (r.width < 4 || r.height < 4) return false
  const cs = getComputedStyle(el)
  if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0' && !el.classList.contains('reveal')) return false
  if (el.textContent.trim()) return true
  if (el.matches(MEDIA) || el.querySelector(MEDIA)) return true
  // small empty decorations with a fill (like the window's traffic-light dots)
  return r.width <= 60 && r.height <= 60 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
}

const visibleChildren = (el) => [...el.children].filter(isVisible)
const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())

/**
 * The pieces a rock breaks into. Wrapper elements with a single child are skipped over
 * (and returned as `shells` so their background disappears too). Empty array = it explodes.
 */
function piecesOf(el) {
  const shells = []
  let cur = el
  for (;;) {
    if (LEAF_TAGS.has(cur.tagName.toUpperCase()) || hasOwnText(cur)) return { pieces: [], shells }
    const kids = visibleChildren(cur)
    if (kids.length !== 1) return { pieces: kids, shells }
    cur = kids[0]
    shells.push(cur)
  }
}

function createGame(onClear) {
  const html = document.documentElement
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  canvas.className = 'ast-canvas'
  const ctx = canvas.getContext('2d')
  const hud = document.createElement('div')
  hud.className = 'ast-hud'
  hud.innerHTML =
    '<span class="ast-hud__score">SCORE 0</span>' +
    '<span class="ast-hud__help">← → turn · ↑ thrust · space fire · esc quit</span>' +
    '<button type="button" class="ast-hud__quit" aria-label="Quit asteroids">✕</button>'
  const scoreEl = hud.querySelector('.ast-hud__score')
  document.body.append(canvas, hud)
  html.classList.add('ast-on')

  let W, H
  const resize = () => {
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
  }
  resize()

  const touched = new Map() // element -> original inline transform, for cleanup
  const anims = []
  const rocks = []
  const bullets = []
  const particles = []
  const ship = { x: W / 2, y: H * 0.6, vx: 0, vy: 0, a: -Math.PI / 2, cool: 0, thrust: false }
  const keys = new Set()
  let touch = null
  let score = 0
  let raf = 0
  let last = performance.now()
  let lastScroll = window.scrollY
  let clearedAt = 0
  let ended = false

  const touch_ = (el) => {
    if (!touched.has(el)) touched.set(el, el.style.transform)
  }

  function addRock(el, vx = 0, vy = 0) {
    touch_(el)
    el.classList.add('ast-rock')
    const r = el.getBoundingClientRect()
    const size = Math.sqrt(r.width * r.height)
    rocks.push({
      el,
      x: 0,
      y: 0,
      rot: 0,
      vx,
      vy,
      vr: vx || vy ? rand(-0.5, 0.5) : 0,
      hp: Math.min(6, 1 + Math.floor(size / 140)),
      maxHp: 0,
      phase: rand(0, TAU),
      jag: Array.from({ length: 28 }, () => rand(-1, 1)),
      rect: r,
    })
    rocks[rocks.length - 1].maxHp = rocks[rocks.length - 1].hp
  }

  // The starting field: the nav bar, each block of the page, and the footer
  const header = document.querySelector('header.nav')
  const main = document.querySelector('main')
  const footer = document.querySelector('footer')
  if (header && isVisible(header)) addRock(header)
  if (main) {
    const { pieces, shells } = piecesOf(main)
    shells.forEach((s) => touch_(s))
    pieces.forEach((p) => addRock(p))
  }
  if (footer && isVisible(footer)) addRock(footer)

  // Leaving the page (clicking a link) ends the game
  const mo = main && new MutationObserver(() => end())
  mo?.observe(main, { childList: true })

  function burst(x, y, n, color, speed = 4, chunky = false) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU)
      const s = rand(0.5, speed)
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(30, 60),
        max: 60,
        color,
        size: chunky ? rand(3, 8) : rand(1, 2.5),
        rot: rand(0, TAU),
        vr: rand(-0.2, 0.2),
        chunky,
      })
    }
  }

  function hit(rock, b) {
    rock.hp--
    anims.push(
      rock.el.animate([{ filter: 'brightness(2.2) drop-shadow(0 0 6px #60a5fa)' }, { filter: 'none' }], { duration: 160 }),
    )
    rock.vx += b.vx * 0.04
    rock.vy += b.vy * 0.04
    score += 10
    burst(b.x, b.y, 6, '#60a5fa', 3)
    if (rock.hp > 0) return
    rocks.splice(rocks.indexOf(rock), 1)
    const r = rock.rect
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const { pieces, shells } = piecesOf(rock.el)
    rock.el.classList.remove('ast-rock')
    if (pieces.length) {
      // Crack open: the shell goes see-through and its children fly apart
      rock.el.classList.add('ast-shell')
      shells.forEach((s) => {
        touch_(s)
        s.classList.add('ast-shell')
      })
      score += 50
      burst(cx, cy, Math.min(40, 8 + r.width / 30), '#94a3b8', 5, true)
      for (const p of pieces) {
        const pr = p.getBoundingClientRect()
        const dx = pr.left + pr.width / 2 - cx
        const dy = pr.top + pr.height / 2 - cy
        const d = Math.hypot(dx, dy) || 1
        const s = rand(1.5, 3.5)
        addRock(p, (dx / d) * s + b.vx * 0.08 + rand(-0.5, 0.5), (dy / d) * s + b.vy * 0.08 + rand(-0.5, 0.5))
      }
    } else {
      // Nothing left inside: explode
      score += 100
      const color = getComputedStyle(rock.el).color || '#e8ecf8'
      burst(cx, cy, Math.min(50, 12 + r.width / 15), color, 6)
      burst(cx, cy, Math.min(14, 4 + r.width / 60), '#94a3b8', 4, true)
      rock.el.classList.add('ast-dead')
      const from = rock.el.style.transform || 'none'
      const anim = rock.el.animate(
        [
          { transform: from, opacity: 1 },
          {
            transform: `${from === 'none' ? '' : from} translate(${b.vx * 6}px, ${b.vy * 6}px) rotate(${rand(-160, 160)}deg) scale(0.2)`,
            opacity: 0,
          },
        ],
        { duration: 550, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
      )
      anims.push(anim)
    }
    scoreEl.textContent = `SCORE ${score}`
    if (!rocks.length && !clearedAt) {
      clearedAt = performance.now()
      scoreEl.textContent = `PAGE CLEARED! · ${score}`
      onClear?.()
    }
  }

  const GAME_KEYS = {
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
    ArrowUp: 'up', w: 'up', W: 'up',
    ' ': 'fire', Spacebar: 'fire',
  }
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      return end()
    }
    const k = GAME_KEYS[e.key]
    if (k || e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      if (k) keys.add(k)
    }
  }
  const onKeyUp = (e) => {
    const k = GAME_KEYS[e.key]
    if (k) keys.delete(k)
  }
  const onTouch = (e) => {
    if (e.target.closest?.('.ast-hud')) return
    e.preventDefault()
    const t = e.touches[0]
    touch = t ? { x: t.clientX, y: t.clientY } : null
  }
  const onTouchEnd = (e) => {
    if (!e.touches.length) touch = null
  }
  const onBlur = () => keys.clear()

  window.addEventListener('keydown', onKeyDown, true)
  window.addEventListener('keyup', onKeyUp, true)
  window.addEventListener('blur', onBlur)
  window.addEventListener('resize', resize)
  window.addEventListener('touchstart', onTouch, { passive: false })
  window.addEventListener('touchmove', onTouch, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
  hud.querySelector('.ast-hud__quit').addEventListener('click', () => end())

  function step(now) {
    raf = requestAnimationFrame(step)
    const k = Math.min((now - last) / 16.667, 3)
    last = now

    // Keep bullets and sparks attached to the page when it scrolls
    const sy = window.scrollY
    const dScroll = sy - lastScroll
    lastScroll = sy
    if (dScroll) for (const o of [...bullets, ...particles]) o.y -= dScroll

    // Read every rock's position first (before writing any transforms)
    for (let i = rocks.length - 1; i >= 0; i--) {
      if (!rocks[i].el.isConnected) rocks.splice(i, 1)
      else rocks[i].rect = rocks[i].el.getBoundingClientRect()
    }

    // Ship
    let turn = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0)
    ship.thrust = keys.has('up')
    let fire = keys.has('fire')
    if (touch) {
      const want = Math.atan2(touch.y - ship.y, touch.x - ship.x)
      const diff = Math.atan2(Math.sin(want - ship.a), Math.cos(want - ship.a))
      turn = Math.max(-1, Math.min(1, diff * 4))
      ship.thrust = Math.hypot(touch.x - ship.x, touch.y - ship.y) > 70
      fire = true
    }
    ship.a += turn * 0.085 * k
    if (ship.thrust) {
      ship.vx += Math.cos(ship.a) * 0.22 * k
      ship.vy += Math.sin(ship.a) * 0.22 * k
      if (Math.random() < 0.6) {
        particles.push({
          x: ship.x - Math.cos(ship.a) * 12,
          y: ship.y - Math.sin(ship.a) * 12,
          vx: -Math.cos(ship.a + rand(-0.4, 0.4)) * 2 + ship.vx,
          vy: -Math.sin(ship.a + rand(-0.4, 0.4)) * 2 + ship.vy,
          life: 18,
          max: 18,
          color: Math.random() < 0.5 ? '#fb7185' : '#fbbf24',
          size: rand(1, 2.5),
        })
      }
    }
    const fr = Math.pow(0.988, k)
    ship.vx *= fr
    ship.vy *= fr
    const sp = Math.hypot(ship.vx, ship.vy)
    if (sp > 9) {
      ship.vx *= 9 / sp
      ship.vy *= 9 / sp
    }
    ship.x += ship.vx * k
    ship.y += ship.vy * k
    if (ship.x < 0) ship.x += W
    if (ship.x > W) ship.x -= W
    // Fly into the top/bottom edge to scroll the page; wrap once there's nowhere left to go
    const edge = 90
    const maxScroll = document.documentElement.scrollHeight - H
    if (ship.y < edge && ship.vy < 0) {
      if (sy > 0) {
        window.scrollTo({ top: Math.max(0, sy + (ship.y - edge)), behavior: 'instant' })
        ship.y = edge
      } else if (ship.y < 0) ship.y += H
    } else if (ship.y > H - edge && ship.vy > 0) {
      if (sy < maxScroll - 1) {
        window.scrollTo({ top: Math.min(maxScroll, sy + (ship.y - (H - edge))), behavior: 'instant' })
        ship.y = H - edge
      } else if (ship.y > H) ship.y -= H
    }

    ship.cool -= k
    if (fire && ship.cool <= 0) {
      ship.cool = 9
      bullets.push({
        x: ship.x + Math.cos(ship.a) * 14,
        y: ship.y + Math.sin(ship.a) * 14,
        vx: Math.cos(ship.a) * 11 + ship.vx,
        vy: Math.sin(ship.a) * 11 + ship.vy,
        life: 70,
      })
    }

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i]
      b.x += b.vx * k
      b.y += b.vy * k
      b.life -= k
      if (b.x < 0) b.x += W
      if (b.x > W) b.x -= W
      if (b.life <= 0 || b.y < -20 || b.y > H + 20) {
        bullets.splice(i, 1)
        continue
      }
      // hit the smallest rock under the bullet
      let target = null
      let best = Infinity
      for (const r of rocks) {
        const q = r.rect
        if (b.x >= q.left && b.x <= q.right && b.y >= q.top && b.y <= q.bottom) {
          const area = q.width * q.height
          if (area < best) {
            best = area
            target = r
          }
        }
      }
      if (target) {
        bullets.splice(i, 1)
        hit(target, b)
      }
    }

    // Rocks drift apart, slow down, and bob gently
    const rf = Math.pow(0.965, k)
    for (const r of rocks) {
      if (!r.vx && !r.vy && !r.vr && !r.x && !r.y) continue
      r.x += r.vx * k
      r.y += r.vy * k
      r.rot += r.vr * k
      r.vx *= rf
      r.vy *= rf
      r.vr *= rf
      r.phase += 0.03 * k
      const bob = Math.sin(r.phase) * 2
      r.el.style.transform = `translate(${r.x.toFixed(1)}px, ${(r.y + bob).toFixed(1)}px) rotate(${r.rot.toFixed(2)}deg)`
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx * k
      p.y += p.vy * k
      p.vx *= Math.pow(0.97, k)
      p.vy *= Math.pow(0.97, k)
      if (p.rot !== undefined) p.rot += p.vr * k
      p.life -= k
      if (p.life <= 0) particles.splice(i, 1)
    }

    draw()

    if (clearedAt && now - clearedAt > 3500) end()
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    // Cracks across rocks as they take damage
    ctx.lineWidth = 1.5
    for (const r of rocks) {
      const q = r.rect
      if (q.bottom < 0 || q.top > H || q.right < 0 || q.left > W) continue
      const dmg = 1 - r.hp / r.maxHp
      ctx.strokeStyle = `rgba(251,113,133,${0.35 + dmg * 0.4})`
      const x0 = q.left
      const y0 = q.top
      const w = q.width
      const h = q.height
      const n = r.jag.length
      if (dmg > 0) {
        ctx.beginPath()
        const cracks = Math.ceil(dmg * 4)
        for (let c = 0; c < cracks; c++) {
          const j = r.jag
          let x = x0 + w * (0.5 + j[c] * 0.15)
          let y = y0 + h * (0.5 + j[c + 7] * 0.15)
          ctx.moveTo(x, y)
          for (let s = 0; s < 3; s++) {
            x += j[(c * 3 + s) % n] * Math.min(w, h) * 0.15 + (c % 2 ? 1 : -1) * w * 0.06
            y += j[(c * 3 + s + 11) % n] * Math.min(w, h) * 0.15 + (c < 2 ? 1 : -1) * h * 0.06
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }
    }

    // Particles
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      if (p.chunky) {
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1.2
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const a = p.rot + (i / 5) * TAU
          const rr = p.size * (i % 2 ? 0.7 : 1)
          const x = p.x + Math.cos(a) * rr
          const y = p.y + Math.sin(a) * rr
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      } else {
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      }
    }
    ctx.globalAlpha = 1

    // Bullets
    ctx.fillStyle = '#fff'
    ctx.shadowColor = '#60a5fa'
    ctx.shadowBlur = 8
    for (const b of bullets) {
      ctx.beginPath()
      ctx.arc(b.x, b.y, 2.2, 0, TAU)
      ctx.fill()
    }

    // Ship
    ctx.save()
    ctx.translate(ship.x, ship.y)
    ctx.rotate(ship.a)
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    if (ship.thrust && Math.random() < 0.8) {
      ctx.strokeStyle = '#fb7185'
      ctx.shadowColor = '#fb7185'
      ctx.beginPath()
      ctx.moveTo(-9, -5)
      ctx.lineTo(-20 - Math.random() * 6, 0)
      ctx.lineTo(-9, 5)
      ctx.stroke()
    }
    ctx.strokeStyle = '#60a5fa'
    ctx.shadowColor = '#3b82f6'
    ctx.shadowBlur = 12
    ctx.fillStyle = 'rgba(7,11,26,0.85)'
    ctx.beginPath()
    ctx.moveTo(16, 0)
    ctx.lineTo(-12, -10)
    ctx.lineTo(-7, 0)
    ctx.lineTo(-12, 10)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
    ctx.shadowBlur = 0
  }

  function end() {
    if (ended) return
    ended = true
    cancelAnimationFrame(raf)
    mo?.disconnect()
    window.removeEventListener('keydown', onKeyDown, true)
    window.removeEventListener('keyup', onKeyUp, true)
    window.removeEventListener('blur', onBlur)
    window.removeEventListener('resize', resize)
    window.removeEventListener('touchstart', onTouch)
    window.removeEventListener('touchmove', onTouch)
    window.removeEventListener('touchend', onTouchEnd)
    anims.forEach((a) => a.cancel())
    for (const [el, transform] of touched) {
      el.classList.remove('ast-rock', 'ast-shell', 'ast-dead')
      el.style.transform = transform
    }
    canvas.remove()
    hud.remove()
    html.classList.remove('ast-on')
    running = null
  }

  raf = requestAnimationFrame(step)
  return { end }
}
