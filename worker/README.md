# Live status Worker

A Cloudflare Worker that checks whether you're live on Twitch, YouTube or
TikTok. The home page uses it to show "is live!" under your name. Results are
cached for 90 seconds.

## Deploy (first time)

From this `worker` folder:

```sh
npx wrangler login      # opens a browser to sign in to Cloudflare (free account is fine)
npx wrangler deploy     # prints a URL like https://live-status.<you>.workers.dev
```

Paste that URL into `liveStatusUrl` in `src/data/site.js`, then commit and push.

## Updating

Change the channel names in `CHANNELS` at the top of `live-status.js`, then run
`npx wrangler deploy` again.

## Notes

- Twitch uses decapi.me, YouTube reads your `@handle/live` page, and TikTok uses
  its unofficial live-room endpoint. None need API keys.
- TikTok may block or change that endpoint. If it does, TikTok just reads as
  offline, and the other two keep working.
- Open the Worker URL in a browser to see the raw status JSON.
