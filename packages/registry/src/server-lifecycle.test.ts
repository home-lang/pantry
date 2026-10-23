import { expect, test } from 'bun:test'
import { InMemoryAnalytics } from './analytics'
import { createLocalRegistry } from './registry'
import { createServer } from './server'
import { getAvailablePort } from './test-utils'

test('a graceful drain keeps its public server handle for repeated stop and forced connection disposal', async () => {
  const port = await getAvailablePort(), base = `http://127.0.0.1:${port}`
  let entered!: () => void, release!: () => void
  const pending = new Promise<void>(done => { entered = done })
  const gate = new Promise<void>(done => { release = done })
  const server = createServer(createLocalRegistry(base), port, new InMemoryAnalytics(), undefined, {
    async getObject() {
      entered()
      await gate
      return Buffer.from(JSON.stringify({ name: 'curl.se', versions: {}, latestVersion: '1.0.0' }))
    },
  })
  server.start()
  const response = fetch(`${base}/binaries/curl.se/metadata.json`).then(response => response.text())
  void response.catch(() => {})
  let draining: Promise<void> | undefined
  try {
    await pending
    draining = server.stop(false)
    expect(server.stop(false)).toBe(draining)
    expect(() => server.start()).toThrow('already running or draining')
    const forced = server.stop(true)
    await expect(response).rejects.toThrow()
    release()
    await forced
  }
  finally {
    release()
    await server.stop(true)
    await draining
    await response.catch(() => {})
  }
})

test('a restarted public server admits writes again after its previous graceful drain', async () => {
  const port = await getAvailablePort(), base = `http://127.0.0.1:${port}`
  const server = createServer(createLocalRegistry(base), port, new InMemoryAnalytics())
  server.start()
  try {
    for (let pass = 0; pass < 2; pass++) {
      const response = await fetch(`${base}/analytics/events`, { method: 'POST', body: '{}' })
      expect(response.status).toBe(400)
      await response.text()
      await server.stop(false)
      if (pass === 0) server.start()
    }
  }
  finally { await server.stop(true) }
})
