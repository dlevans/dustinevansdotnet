// Cloudflare Worker: reports whether jedihagrid is live on Twitch, YouTube or TikTok.
// GET / -> { live: bool, platforms: [{ id, label, live, url }], checkedAt }
// Results are cached for CACHE_SECONDS so the platforms aren't hit on every visit.
// Deploy: see worker/README.md.

const CACHE_SECONDS = 90
const ALLOWED_ORIGINS = ['https://dustinevans.net', 'https://www.dustinevans.net']
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

const CHANNELS = {
  twitch: 'jedihagrid',
  youtube: 'JediHagrid', // the @handle
  tiktok: 'jedihagrid',
}

// Each check returns { live, url }; any error counts as not live.
export async function checkTwitch(user = CHANNELS.twitch) {
  const url = `https://www.twitch.tv/${user}`
  const res = await fetch(`https://decapi.me/twitch/uptime/${user}`, { headers: { 'User-Agent': UA } })
  const text = (await res.text()).trim().toLowerCase()
  // decapi answers with an uptime ("1 hour, 2 minutes") when live, or "<user> is offline".
  return { live: res.ok && text !== '' && !text.includes('offline') && !text.includes('error'), url }
}

export async function checkYouTube(handle = CHANNELS.youtube) {
  const channel = `https://www.youtube.com/@${handle}`
  // /live redirects to the current stream when live; otherwise shows the channel page.
  const res = await fetch(`${channel}/live`, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en', Cookie: 'SOCS=CAI; CONSENT=YES+1' },
  })
  const html = await res.text()
  const live = /"isLiveNow":\s*true/.test(html)
  const id = live && html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)
  return { live, url: id ? `https://www.youtube.com/watch?v=${id[1]}` : `${channel}/live` }
}

export async function checkTikTok(user = CHANNELS.tiktok) {
  const url = `https://www.tiktok.com/@${user}/live`
  const res = await fetch(
    `https://www.tiktok.com/api-live/user/room/?aid=1988&sourceType=54&uniqueId=${encodeURIComponent(user)}`,
    { headers: { 'User-Agent': UA, Referer: url } },
  )
  const data = await res.json()
  // liveRoom.status 2 = live, 4 = ended/offline.
  return { live: data?.data?.liveRoom?.status === 2 || data?.data?.user?.status === 2, url }
}

const CHECKS = [
  { id: 'twitch', label: 'Twitch', check: checkTwitch },
  { id: 'youtube', label: 'YouTube', check: checkYouTube },
  { id: 'tiktok', label: 'TikTok', check: checkTikTok },
]

export async function getStatus() {
  const platforms = await Promise.all(
    CHECKS.map(async ({ id, label, check }) => {
      try {
        return { id, label, ...(await check()) }
      } catch (err) {
        return { id, label, live: false, url: null, error: String(err?.message || err) }
      }
    }),
  )
  return { live: platforms.some((p) => p.live), platforms, checkedAt: new Date().toISOString() }
}

function corsHeaders(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '')
  return ok ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin')
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { ...corsHeaders(origin), 'Access-Control-Allow-Methods': 'GET' } })
    }
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 })

    const cache = caches.default
    const key = new Request(new URL('/status', request.url).toString())
    let res = await cache.match(key)
    if (!res) {
      res = new Response(JSON.stringify(await getStatus()), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
      })
      ctx.waitUntil(cache.put(key, res.clone()))
    }
    const out = new Response(res.body, res)
    for (const [k, v] of Object.entries(corsHeaders(origin))) out.headers.set(k, v)
    return out
  },
}
