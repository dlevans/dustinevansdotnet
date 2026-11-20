import { useEffect, useRef } from 'react'

/** Full-page twinkling starfield with occasional blue/red shooting stars. */
export default function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, stars, raf
    const shooting = []
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.width = window.innerWidth * dpr
      h = canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      const count = Math.floor((window.innerWidth * window.innerHeight) / 6000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.1 + 0.3) * dpr,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      }))
    }

    const spawnShootingStar = () => {
      const fromLeft = Math.random() < 0.5
      shooting.push({
        x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
        y: Math.random() * h * 0.4,
        vx: (fromLeft ? 1 : -1) * (8 + Math.random() * 6) * dpr,
        vy: (4 + Math.random() * 3) * dpr,
        life: 1,
        color: Math.random() < 0.5 ? '96,165,250' : '251,113,133',
      })
    }

    let nextShot = performance.now() + 1500
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        s.phase += s.speed
        const a = reduced ? 0.6 : 0.35 + Math.sin(s.phase) * 0.35
        ctx.fillStyle = `rgba(220,230,255,${a})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reduced) {
        if (t > nextShot) {
          spawnShootingStar()
          nextShot = t + 2500 + Math.random() * 4000
        }
        for (let i = shooting.length - 1; i >= 0; i--) {
          const s = shooting[i]
          const tail = 14
          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail)
          grad.addColorStop(0, `rgba(${s.color},${s.life})`)
          grad.addColorStop(1, `rgba(${s.color},0)`)
          ctx.strokeStyle = grad
          ctx.lineWidth = 2 * dpr
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail)
          ctx.stroke()
          s.x += s.vx
          s.y += s.vy
          s.life -= 0.012
          if (s.life <= 0 || s.x < -200 || s.x > w + 200 || s.y > h + 200) shooting.splice(i, 1)
        }
        raf = requestAnimationFrame(draw)
      }
    }

    // Meteor shower on demand: window.dispatchEvent(new Event('fx:meteors'))
    const meteorTimers = []
    const onMeteors = () => {
      if (reduced) return
      for (let i = 0; i < 24; i++) meteorTimers.push(setTimeout(spawnShootingStar, i * 110 + Math.random() * 120))
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('fx:meteors', onMeteors)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('fx:meteors', onMeteors)
      meteorTimers.forEach(clearTimeout)
    }
  }, [])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
