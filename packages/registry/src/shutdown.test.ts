import { expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRegistryShutdown } from './shutdown'
import { FileMetadataStorage } from './storage/metadata'

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>(done => { resolve = done })
  return { promise, resolve }
}

test('shutdown drains a real HTTP mutation before flushing its persisted package snapshot', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pantry-shutdown-'))
  const store = new FileMetadataStorage(join(dir, 'metadata.json'))
  const entered = deferred(), release = deferred()
  let flushed = false
  const server = Bun.serve({ port: 0, hostname: '127.0.0.1', async fetch() {
    entered.resolve()
    await release.promise
    await store.putVersion('shutdown-package', '1.0.0', { name: 'shutdown-package', version: '1.0.0', publishedAt: '2026-10-23T00:00:00Z' })
    return new Response('accepted')
  } })
  const response = fetch(server.url, { method: 'POST' }).then(async response => ({ status: response.status, text: await response.text() }))
  try {
    await entered.promise
    const shutdown = createRegistryShutdown(server, [{ flush: async () => { await store.flush(); flushed = true } }], 2000)
    const stopped = shutdown()
    expect(shutdown()).toBe(stopped)
    await Promise.resolve()
    expect(flushed).toBe(false)
    release.resolve()
    expect(await response).toEqual({ status: 200, text: 'accepted' })
    await stopped
    const reopened = new FileMetadataStorage(join(dir, 'metadata.json'))
    await reopened.flush()
    expect(await reopened.getPackageVersion('shutdown-package', '1.0.0')).toMatchObject({ name: 'shutdown-package', version: '1.0.0' })
    await reopened.flush()
    expect(flushed).toBe(true)
  }
  finally {
    release.resolve()
    await server.stop(true)
    await response.catch(() => {})
    await store.flush()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('one failing snapshot does not suppress the other flushes or report a successful shutdown', async () => {
  const failure = new Error('bucket unavailable'), calls: string[] = []
  const shutdown = createRegistryShutdown({ stop: async () => { calls.push('drain') } }, [
    { flush: async () => { calls.push('failed'); throw failure } },
    { flush: async () => { calls.push('other') } },
    {},
  ], 1000)
  await expect(shutdown()).rejects.toThrow('snapshot')
  expect(calls.slice(0, 3)).toEqual(['drain', 'failed', 'other'])
})

test('the finite shutdown deadline forces remaining connections closed and fails instead of skipping drain', async () => {
  const stopped = deferred(), calls: boolean[] = []
  let flushed = false
  const shutdown = createRegistryShutdown({ stop: async (force = false) => {
    calls.push(force)
    if (force) stopped.resolve()
    await stopped.promise
  } }, [{ flush: async () => { flushed = true } }], 25)
  await expect(shutdown()).rejects.toThrow('deadline')
  expect(calls).toEqual([false, true])
  expect(flushed).toBe(false)
})


for (const fails of [false, true]) {
  test(`real SIGTERM ${fails ? 'reports a failed store after flushing its peers' : 'flushes accepted package metadata before the process exits'}`, async () => {
    const dir = mkdtempSync(join(tmpdir(), 'pantry-shutdown-signal-'))
    const ready = join(dir, 'ready'), file = join(dir, 'metadata.json'), peer = join(dir, 'peer-flushed')
    const code = `
      import { installRegistryShutdown } from ${JSON.stringify(join(import.meta.dir, 'shutdown.ts'))};
      import { FileMetadataStorage } from ${JSON.stringify(join(import.meta.dir, 'storage/metadata.ts'))};
      const store = new FileMetadataStorage(${JSON.stringify(file)});
      await store.flush();
      const server = Bun.serve({ port: 0, hostname: '127.0.0.1', async fetch() {
        await store.putVersion('signal-package', '1.0.0', { name: 'signal-package', version: '1.0.0', publishedAt: '2026-10-23T00:00:00Z' });
        return new Response('accepted');
      } });
      installRegistryShutdown(server, [store, { flush: async () => { await Bun.write(${JSON.stringify(peer)}, 'flushed'); } },
        ${fails ? "{ flush: async () => { throw new Error('deliberate unavailable snapshot'); } }" : '{}'}]);
      await Bun.write(${JSON.stringify(ready)}, server.url.href);
    `
    const child = Bun.spawn([process.execPath, '-e', code], { stdout: 'ignore', stderr: 'pipe' })
    let timer: ReturnType<typeof setTimeout> | undefined
    const stderr = new Response(child.stderr).text()
    try {
      const deadline = performance.now() + 5000
      while (!existsSync(ready) && child.exitCode === null && performance.now() < deadline) await Bun.sleep(10)
      expect(existsSync(ready)).toBe(true)
      const response = await fetch(readFileSync(ready, 'utf8'), { method: 'POST' })
      expect(response.status).toBe(200)
      expect(await response.text()).toBe('accepted')
      child.kill('SIGTERM')
      const exit = await Promise.race([child.exited, new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error('Signal shutdown did not exit')), 3000) })])
      expect(exit).toBe(fails ? 1 : 0)
      expect(readFileSync(peer, 'utf8')).toBe('flushed')
      const reopened = new FileMetadataStorage(file)
      await reopened.flush()
      expect(await reopened.getPackageVersion('signal-package', '1.0.0')).toMatchObject({ name: 'signal-package', version: '1.0.0' })
      if (fails) expect(await stderr).toContain('Registry snapshot persistence failed')
    }
    finally {
      clearTimeout(timer)
      if (child.exitCode === null) child.kill('SIGKILL')
      await child.exited
      await stderr
      rmSync(dir, { recursive: true, force: true })
    }
  })
}
