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

## Twitch API keys (recommended)

decapi.me doesn't always answer Cloudflare correctly, so give the Worker
Twitch's official API:

1. Go to https://dev.twitch.tv/console/apps and click **Register Your Application**.
   - Name: anything, e.g. `dustinevans-live-status`
   - OAuth Redirect URL: `http://localhost`
   - Category: Website Integration; Client Type: Confidential
2. Open the app, copy the **Client ID**, and click **New Secret** to get a secret.
3. From this folder, store both in the Worker (each command prompts you to paste):

   ```sh
   npx wrangler secret put TWITCH_CLIENT_ID
   npx wrangler secret put TWITCH_CLIENT_SECRET
   ```

Without these, Twitch falls back to decapi.me and the status JSON includes a
`detail` field showing what decapi answered.

## Updating

Change the channel names in `CHANNELS` at the top of `live-status.js`, then run
`npx wrangler deploy` again.

## Notes

- Twitch uses the Helix API (or decapi.me as a fallback), YouTube reads your `@handle/live` page, and TikTok uses
  its unofficial live-room endpoint. Only Twitch's API needs keys.
- TikTok may block or change that endpoint. If it does, TikTok just reads as
  offline, and the other two keep working.
- Open the Worker URL in a browser to see the raw status JSON.
