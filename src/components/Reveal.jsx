import { useEffect, useRef, useState } from 'react'

/* Fade/slide elements in as they scroll into view */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

export function SectionTitle({ kicker, title, children }) {
  return (
    <Reveal className="section-title">
      <p className="mono kicker">{kicker}</p>
      <h2>{title}</h2>
      {children}
    </Reveal>
  )
}
