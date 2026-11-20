import confetti from 'canvas-confetti'

const COLORS = ['#3b82f6', '#60a5fa', '#ef4444', '#fb7185', '#ffffff']
const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 1000 }

/** Confetti burst from a point. Pass a MouseEvent or {x, y} in 0..1 */
export function confettiBurst(origin) {
  let o = { x: 0.5, y: 0.6 }
  if (origin && 'clientX' in origin) {
    o = { x: origin.clientX / window.innerWidth, y: origin.clientY / window.innerHeight }
  } else if (origin) {
    o = origin
  }
  const fire = (ratio, opts) =>
    confetti({ ...base, origin: o, particleCount: Math.floor(160 * ratio), ...opts })
  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

/** Side cannons — confetti shooting in from both edges */
export function confettiCannons(duration = 1800) {
  const end = Date.now() + duration
  ;(function frame() {
    confetti({ ...base, particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.75 } })
    confetti({ ...base, particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.75 } })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

/** Fireworks — random bursts across the top of the screen */
export function fireworks(duration = 4000) {
  const end = Date.now() + duration
  const rand = (a, b) => Math.random() * (b - a) + a
  const id = setInterval(() => {
    const left = end - Date.now()
    if (left <= 0) return clearInterval(id)
    const count = 60 * (left / duration) + 20
    const opts = { ...base, startVelocity: 30, spread: 360, ticks: 70, gravity: 0.8, particleCount: count }
    confetti({ ...opts, origin: { x: rand(0.1, 0.3), y: rand(0.1, 0.4) } })
    confetti({ ...opts, origin: { x: rand(0.7, 0.9), y: rand(0.1, 0.4) } })
  }, 260)
}

/** Emoji rain — e.g. emojiRain('⚔️') */
export function emojiRain(emoji = '✨', duration = 2000) {
  const shape = confetti.shapeFromText({ text: emoji, scalar: 2 })
  const end = Date.now() + duration
  const id = setInterval(() => {
    if (Date.now() > end) return clearInterval(id)
    confetti({
      ...base,
      shapes: [shape],
      scalar: 2,
      particleCount: 3,
      spread: 160,
      startVelocity: 10,
      gravity: 0.6,
      ticks: 200,
      flat: true,
      origin: { x: Math.random(), y: -0.05 },
    })
  }, 90)
}
