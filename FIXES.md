# Four fixes (apply on top of frontend-final.zip)

1. **Unzip over your project**, then **DELETE `app/loading.tsx` by hand** (a zip cannot delete files).
   A test fails if that file still exists.
2. Run `npm test`, `npm run test:e2e`.

| # | Problem | Fix |
|---|---|---|
| 1 | Unknown `/projects/x` and `/blog/x` answered HTTP 200 (soft 404) | Removed the root `app/loading.tsx` (it makes Next send the status before `notFound()` runs). Admin server-rendered pages keep a loading state via `app/admin/(protected)/loading.tsx`. |
| 2 | Blog dates | The backend sends NO `updatedAt` for blog posts. The frontend invented one, and building a date from it crashed every blog post page (`RangeError: Invalid time value`) against the real API. `updatedAt` is now optional end to end; the sitemap uses updatedAt, else publish date, else creation date. |
| 3 | `useProjects` stored an error response as the project list | Checks `response.ok` and that the body is a list. |
| 4 | Contact: failure reason only visible after replaying the snake game | The reason is shown immediately above the gate. |

To get true "last edited" dates for posts, the backend would have to start sending `updatedAt` in its blog responses (it already has the value). The frontend will use it automatically.
