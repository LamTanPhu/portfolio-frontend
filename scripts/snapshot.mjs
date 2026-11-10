// Usage: npm run snapshot [-- <api-url>] [--allow-empty] [--out <file>]
//
// Exports the backend's PUBLIC responses into data/api-snapshot.json, which the
// frontend serves when the backend is unreachable (see SNAPSHOT.md).
//
//   API_URL=https://my-api.onrender.com/api npm run snapshot
//   npm run snapshot -- http://localhost:3001/api
//
// All-or-nothing: if any request fails, nothing is written. It also refuses to
// overwrite the snapshot with an empty one (an unseeded database) unless you
// pass --allow-empty.
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Keep in sync with the paths the Api*Repository read methods request.
const LIST_PATHS = [
    '/about/skills',
    '/about/education',
    '/about/jobs',
    '/about/certifications',
    '/about/social',
    '/projects',
    '/blogs',
]
// Lists whose items each have a detail page at `${path}/${slug}`.
const DETAIL_LISTS = ['/projects', '/blogs']

const REQUEST_TIMEOUT_MS = 70_000 // a cold free-tier backend can take ~60s to wake
const MAX_ATTEMPTS = 4

const args = process.argv.slice(2)
const allowEmpty = args.includes('--allow-empty')
const outIndex = args.indexOf('--out')
const outArg = outIndex !== -1 ? args[outIndex + 1] : undefined
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out')

const apiUrl = (positional[0] || process.env.API_URL || 'http://localhost:3001/api').replace(/\/+$/, '')
const outFile = resolve(
    outArg || resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'api-snapshot.json'),
)

if (!/^https?:\/\//i.test(apiUrl)) {
    console.error(`API URL must be absolute, e.g. https://my-api.onrender.com/api (got "${apiUrl}")`)
    process.exit(2)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJson(path) {
    let lastError
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        let retryable = true
        try {
            const res = await fetch(`${apiUrl}${path}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
            if (res.ok) return await res.json()
            lastError = new Error(`GET ${path} -> HTTP ${res.status}`)
            retryable = res.status >= 500 // a 4xx won't fix itself
        } catch (err) {
            lastError = err // network error, timeout or bad JSON: worth another go
        }
        if (!retryable) throw lastError
        if (attempt < MAX_ATTEMPTS) {
            console.error(`  attempt ${attempt}/${MAX_ATTEMPTS} for ${path} failed (${lastError?.message ?? lastError}); retrying…`)
            await sleep(3000 * attempt)
        }
    }
    throw new Error(`GET ${path} failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message ?? lastError}`)
}

async function main() {
    console.log(`Snapshotting ${apiUrl}`)
    const entries = {}

    for (const path of LIST_PATHS) {
        const body = await fetchJson(path)
        if (!Array.isArray(body)) throw new Error(`GET ${path} did not return an array`)
        entries[path] = body
        console.log(`  ${path}: ${body.length}`)
    }

    for (const listPath of DETAIL_LISTS) {
        for (const item of entries[listPath]) {
            if (typeof item?.slug !== 'string' || !item.slug) {
                throw new Error(`An item in ${listPath} has no slug — can't snapshot its detail page`)
            }
            // Raw slug, not encoded: the key must equal the path the repositories request.
            const detailPath = `${listPath}/${item.slug}`
            entries[detailPath] = await fetchJson(detailPath)
        }
    }

    const total = LIST_PATHS.reduce((sum, p) => sum + entries[p].length, 0)
    if (total === 0 && !allowEmpty) {
        throw new Error(
            'Every list came back empty — refusing to overwrite the snapshot with nothing. ' +
                'Is the database seeded? Pass --allow-empty to write it anyway.',
        )
    }

    const snapshot = { generatedAt: new Date().toISOString(), entries }
    await mkdir(dirname(outFile), { recursive: true })
    const tmp = `${outFile}.tmp`
    await writeFile(tmp, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
    await rename(tmp, outFile)

    console.log(`\nWrote ${Object.keys(entries).length} entries to ${outFile}`)
    console.log('Commit it so the next deploy ships the new snapshot.')
}

main().catch((err) => {
    console.error(`\nSnapshot failed: ${err.message}`)
    process.exit(1)
})
