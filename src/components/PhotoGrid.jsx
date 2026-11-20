import { useEffect, useEffectEvent, useState } from 'react'

/**
 * Masonry photo grid with a keyboard-friendly lightbox.
 * Pass `activeName` + `onActiveChange` to keep the open photo in the URL.
 */
export default function PhotoGrid({ photos, activeName, onActiveChange }) {
  const [localOpen, setLocalOpen] = useState(-1)
  const open = onActiveChange ? photos.findIndex((p) => p.name === activeName) : localOpen
  const current = photos[open]
  const isOpen = open >= 0

  const show = (i, options) => {
    if (onActiveChange) onActiveChange(photos[i]?.name ?? null, options)
    else setLocalOpen(i)
  }
  const close = () => show(-1)
  // Stepping replaces the history entry, so Back leaves the viewer in one press
  const step = (by) => show((open + by + photos.length) % photos.length, { replace: true })

  const onKey = useEffectEvent((e) => {
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowLeft') step(-1)
  })

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  return (
    <>
      <div className="photos">
        {photos.map((p, i) => (
          <button
            type="button"
            key={p.src || `ph-${i}`}
            className="photo"
            style={{ aspectRatio: p.ratio || '4 / 5' }}
            onClick={() => show(i)}
            aria-label={`Open photo: ${p.alt || p.caption || i + 1}`}
          >
            {p.src ? (
              <img src={p.thumb || p.src} alt={p.alt || ''} loading="lazy" />
            ) : (
              <span className="photo__placeholder" data-variant={i % 4}>
                <span>📷</span>
              </span>
            )}
            {(p.caption || p.category) && (
              <span className="photo__caption">
                {p.caption && <strong>{p.caption}</strong>}
                {p.category && <span className="mono">{p.category}</span>}
              </span>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
          <button type="button" className="lightbox__close" aria-label="Close" onClick={close}>
            ✕
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox__nav lightbox__nav--prev"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="lightbox__nav lightbox__nav--next"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
              >
                ›
              </button>
            </>
          )}
          <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
            {current.src ? (
              <img src={current.src} alt={current.alt || ''} />
            ) : (
              <div className="lightbox__placeholder" style={{ aspectRatio: current.ratio || '4 / 5' }}>
                📷 Photo coming soon
              </div>
            )}
            {(current.caption || current.category) && (
              <figcaption>
                {current.caption}
                {current.category && <span className="mono"> · {current.category}</span>}
              </figcaption>
            )}
            <span className="lightbox__count mono">
              {open + 1} / {photos.length}
            </span>
          </figure>
        </div>
      )}
    </>
  )
}
