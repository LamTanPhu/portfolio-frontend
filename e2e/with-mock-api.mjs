// Usage: node e2e/with-mock-api.mjs <command...>
// Starts the mock API, waits until it answers, runs the command (inheriting
// stdio), then shuts the mock down and exits with the command's exit code.
import { spawn } from 'node:child_process'

const [cmd, ...args] = process.argv.slice(2)
if (!cmd) {
    console.error('usage: node e2e/with-mock-api.mjs <command...>')
    process.exit(2)
}

const port = process.env.MOCK_API_PORT ?? '3001'
const mock = spawn(process.execPath, ['e2e/mock-api/server.mjs'], { stdio: 'inherit', env: process.env })

async function waitForMock() {
    for (let i = 0; i < 50; i++) {
        try {
            const res = await fetch(`http://localhost:${port}/__health`)
            if (res.ok) return
        } catch { /* not up yet */ }
        await new Promise((r) => setTimeout(r, 100))
    }
    throw new Error('mock API did not start in time')
}

let code = 1
try {
    await waitForMock()
    code = await new Promise((resolve) => {
        const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', env: process.env })
        child.on('exit', (c) => resolve(c ?? 1))
    })
} catch (err) {
    console.error(err)
} finally {
    mock.kill()
}
process.exit(code)
