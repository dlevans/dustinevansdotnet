import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { profile } from '../data/site'
import { iconFor } from '../icons'

const POLL_MS = 2 * 60 * 1000

// Add ?live to the URL to preview the badge with fake data.
const PREVIEW = {
  live: true,
  platforms: [
    { id: 'twitch', label: 'Twitch', live: true, url: 'https://www.twitch.tv/jedihagrid' },
    { id: 'youtube', label: 'YouTube', live: true, url: 'https://www.youtube.com/@JediHagrid/live' },
  ],
}

function useLiveStatus(url) {
  const [preview] = useState(() => new URLSearchParams(window.location.search).has('live'))
  const [status, setStatus] = useState(preview ? PREVIEW : null)
  useEffect(() => {
    if (preview || !url) return
    let stopped = false
    const load = async () => {
      if (document.hidden) return
      try {
        const res = await fetch(url)
        if (res.ok && !stopped) setStatus(await res.json())
      } catch {
        /* offline or worker down: keep the last known status */
      }
    }
    load()
    const id = setInterval(load, POLL_MS)
    document.addEventListener('visibilitychange', load)
    return () => {
      stopped = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', load)
    }
  }, [url, preview])
  return status
}

/** "is live!" + watch links, shown under the hero name while streaming. */
export default function LiveBadge() {
  const status = useLiveStatus(profile.liveStatusUrl)
  const live = status?.platforms?.filter((p) => p.live && p.url) ?? []
  if (!live.length) return null
  return (
    <div className="hero__live" role="status">
      <span className="hero__live-label">
        <span className="hero__live-dot" aria-hidden="true" /> is live!
      </span>
      {live.map((p) => (
        <a key={p.id} className="hero__live-link" href={p.url} target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={iconFor(p.id)} /> Watch on {p.label} ↗
        </a>
      ))}
    </div>
  )
}
