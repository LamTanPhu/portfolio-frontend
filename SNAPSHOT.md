# Backend-down fallback (snapshot)

The public pages read from the backend at build time and every 60 s after. If the
backend is asleep (free-tier Render), slow or failing, those reads fall back to
`data/api-snapshot.json` — a committed copy of the backend's public responses —
so a build never fails and a page never blanks because the backend is down.

## Refresh it (whenever you change content)

```bash
# backend running and seeded (locally or deployed)
npm run snapshot                                   # http://localhost:3001/api
API_URL=https://my-api.onrender.com/api npm run snapshot
git add data/api-snapshot.json && git commit -m "Refresh snapshot"
```

All-or-nothing: if any request fails nothing is written, and it refuses to
overwrite the file with an empty snapshot (unseeded DB) unless `--allow-empty`.
A cold Render backend is retried for about a minute before giving up.

The file shipped in the repo is an empty placeholder (every list is `[]`). Until
you run the command above, a backend outage renders empty sections instead of
failing. Run it once after seeding, before the first deploy.

## What falls back, and what never does

| Situation | Result |
|---|---|
| Network error, timeout (8 s), 5xx, 429 | Snapshot served, one line to stderr: `[snapshot-fallback] GET /blogs failed (...)` |
| Live 404 (post/project deleted) | Still a 404 — never stale data |
| Other 4xx | Error, as before |
| Path not in the snapshot (e.g. a post published after the last snapshot) | Original error |
| Admin screens, anything with an access token, any POST/PATCH/DELETE | Always live — never the snapshot |

Only the public Server Component pages use it (`loadPublic*.ts` loaders, the
sitemap). Admin code keeps the original `load*.ts` loaders.

A fallback during ISR is cached until the next revalidation (60 s), then the live
backend is tried again, so the site heals itself once the backend is back.
Tune the wait with `SNAPSHOT_FALLBACK_TIMEOUT_MS` (server runtime env).

## Notes

- `next dev` with the backend off now shows snapshot data plus stderr lines
  instead of a hard error. Look for `[snapshot-fallback]` if something looks stale.
- Posts/projects published after the last snapshot 404 or error while the
  backend is down; the list pages simply won't show them.
- Vercel and Docker builds both include `data/` (it is committed and not in
  `.dockerignore`).
