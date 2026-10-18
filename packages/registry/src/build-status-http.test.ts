import { afterEach, beforeEach, expect, it } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { InMemoryAnalytics } from './analytics'
import { InMemoryAuthStorage } from './auth'
import { createBuildStatusFixture } from './build-status-test-utils'
import { Registry } from './registry'
import { createServer } from './server'
import { S3RequestError } from './storage/aws-client'
import { BuildStatusStore } from './storage/build-status'
import { getAvailablePort } from './test-utils'

const token = 'owned-build-status-http-fixture'
const originalEvent = { domain: 'bun.sh', version: '1.4.3', platform: 'linux-x86-64', state: 'built' as const }
const incomingEvent = { domain: 'git-scm.org', version: '2.53.0', platform: 'linux-x86-64', state: 'built' as const }
const resources: Array<{ server: ReturnType<typeof createServer>, registry: Registry, directory: string, store: BuildStatusStore }> = []
let previousToken: string | undefined

beforeEach(() => {
  previousToken = process.env.PANTRY_REGISTRY_TOKEN
  process.env.PANTRY_REGISTRY_TOKEN = token
})

afterEach(async () => {
  try {
    for (const { server, registry, directory, store } of resources.splice(0)) {
      await server.stop(true)
      await store.ready()
      await store.flush()
      await registry.metadata.flush?.()
      rmSync(directory, { recursive: true, force: true })
    }
  }
  finally {
    if (previousToken === undefined) delete process.env.PANTRY_REGISTRY_TOKEN
    else process.env.PANTRY_REGISTRY_TOKEN = previousToken
  }
})

async function start(store: BuildStatusStore) {
  const port = await getAvailablePort()
  const baseUrl = `http://127.0.0.1:${port}`
  const directory = mkdtempSync(join(tmpdir(), 'pantry-build-status-http-'))
  const registry = new Registry({ s3Bucket: 'local', dynamoTable: 'local', baseUrl, port, localStoragePath: directory })
  const server = createServer(registry, port, new InMemoryAnalytics(), undefined, undefined, undefined, new InMemoryAuthStorage(), undefined, undefined, store)
  resources.push({ server, registry, directory, store })
  server.start()
  return {
    async report() {
      return fetch(`${baseUrl}/api/build-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(incomingEvent),
      })
    },
    async queue(domain: string) {
      return fetch(`${baseUrl}/api/rebuild`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain }),
      })
    },
    async readQueue() {
      return (await fetch(`${baseUrl}/api/rebuild-queue`)).json() as Promise<{ queue: string[] }>
    },
  }
}

for (const heldKey of ['build-status/status.json', 'build-status/coverage.json']) {
  it(`waits for the real HTTP report's ${heldKey} hydration before acknowledging and persisting it`, async () => {
    let held = false
    let entered!: () => void
    let release!: () => void
    const reading = new Promise<void>(resolve => { entered = resolve })
    const gate = new Promise<void>(resolve => { release = resolve })
    const fixture = createBuildStatusFixture(async key => {
      if (held && key === heldKey) {
        entered()
        await gate
      }
    })
    await fixture.store.ready()
    fixture.store.record(originalEvent)
    await fixture.store.flush()
    held = true
    const restarted = new BuildStatusStore(fixture.storage, fixture.bucket)
    const http = await start(restarted)
    let acknowledged = false
    const request = http.report().then(response => {
      acknowledged = true
      return response
    })
    try {
      await reading
      await Promise.resolve()
      expect(acknowledged).toBe(false)
    }
    finally {
      held = false
      release()
    }
    const response = await request
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, recorded: 1 })
    await restarted.flush()
    const persisted = JSON.parse(fixture.storage.objects.get('build-status/status.json')!.toString())
    expect(persisted.recent.map((event: { domain: string }) => event.domain)).toContain(originalEvent.domain)
    expect(persisted.recent.map((event: { domain: string }) => event.domain)).toContain(incomingEvent.domain)
  })

  it(`refuses a real HTTP ACK when ${heldKey} is unavailable, preserves bytes, and accepts a healthy retry`, async () => {
    let unavailable = false
    const fixture = createBuildStatusFixture(async key => {
      if (unavailable && key === heldKey) throw new S3RequestError('GET', 503, 'ServiceUnavailable')
    })
    await fixture.store.ready()
    fixture.store.record(originalEvent)
    await fixture.store.flush()
    const original = Buffer.from(fixture.storage.objects.get('build-status/status.json')!)
    unavailable = true
    const restarted = new BuildStatusStore(fixture.storage, fixture.bucket)
    const http = await start(restarted)
    try {
      const response = await http.report()
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Internal server error' })
      expect(fixture.storage.objects.get('build-status/status.json')).toEqual(original)
    }
    finally {
      unavailable = false
    }
    const response = await http.report()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, recorded: 1 })
    await restarted.flush()
    const persisted = JSON.parse(fixture.storage.objects.get('build-status/status.json')!.toString())
    expect(persisted.recent.map((event: { domain: string }) => event.domain)).toContain(originalEvent.domain)
    expect(persisted.recent.map((event: { domain: string }) => event.domain)).toContain(incomingEvent.domain)
  })
}

it('keeps two live servers\' hydrated rebuild queues in their own injected stores', async () => {
  const first = await start(createBuildStatusFixture().store)
  const second = await start(createBuildStatusFixture().store)
  const response = await first.queue('curl.se')
  expect(response.status).toBe(200)
  await response.json()
  expect((await first.readQueue()).queue).toContain('curl.se')
  expect((await second.readQueue()).queue).toEqual([])
})
