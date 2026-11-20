import { useEffect, useState } from 'react'

/** Cycles through words with a flip/blur transition. */
export default function FlipWords({ words, interval = 2400 }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [words.length, interval])
  return (
    <span className="flip" aria-live="polite">
      <span key={i} className="flip__word">
        {words[i]}
      </span>
    </span>
  )
}
