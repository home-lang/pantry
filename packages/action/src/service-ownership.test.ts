import { expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnNativeService, stopNativeService } from './native-services'
import type { NativeServiceState } from './native-services'
import { assertServiceDirectory, assertServiceProcess, claimServiceDirectory, serviceProcessIdentity } from './service-ownership'

test('directory cleanup requires this invocation owner marker', () => {
  const directory = mkdtempSync(join(tmpdir(), 'pantry-owner-test-'))
  try {
    const owner = claimServiceDirectory(directory)
    expect(() => assertServiceDirectory(directory, owner)).not.toThrow()
    expect(() => assertServiceDirectory(directory, 'other-job')).toThrow('unowned')
    writeFileSync(join(directory, '.pantry-service-owner'), 'replacement')
    expect(() => assertServiceDirectory(directory, owner)).toThrow('unowned')
  }
  finally { rmSync(directory, { recursive: true, force: true }) }
})

// Five sequential kernel identity reads each retain their existing two-second
// Darwin deadline. The default test budget truncated valid reads on a busy host.
test('a different process birth or command is rejected without signalling it', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pantry-foreign-test-'))
  try {
    const identity = (await serviceProcessIdentity(process.pid))!
    expect(identity.uid).toBe(process.getuid!())
    await expect(assertServiceProcess({ ...identity, birth: 'not-this-process' }, directory)).rejects.toThrow('foreign or reused')
    await expect(assertServiceProcess({ ...identity, command: 'other-job' }, directory)).rejects.toThrow('foreign or reused')
    await expect(assertServiceProcess({ ...identity, group: identity.group + 1 }, directory)).rejects.toThrow('foreign or reused')
    expect(await serviceProcessIdentity(process.pid)).toEqual(identity)
  }
  finally { rmSync(directory, { recursive: true, force: true }) }
}, 12_000)

test('captures and stops only its owned foreground process, then removes private data', async () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-owned-process-')))
  const marker = join(directory, 'child-ready')
  const state: NativeServiceState = { name: 'typesense', directory, owner: claimServiceDirectory(directory), binDir: directory, libraries: {} }
  try {
    await spawnNativeService(state, process.execPath, [
      '-e', 'process.on("SIGTERM", () => process.exit(143)); require("node:fs").writeFileSync(process.argv[1], String(process.pid)); setInterval(() => {}, 1000)', marker, directory,
    ], process.env)
    const deadline = Date.now() + 3000
    while (!existsSync(marker) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 25))
    expect(existsSync(marker)).toBe(true)
    const child = Number(readFileSync(marker, 'utf8'))
    expect(state.process?.pid).toBe(state.pid)
    expect(await assertServiceProcess(state.process!, directory)).toBe(true)
    expect((await serviceProcessIdentity(child))?.group).toBe(state.process?.group)
    await stopNativeService(state)
    expect(existsSync(directory)).toBe(false)
    expect(await serviceProcessIdentity(state.pid!)).toBeUndefined()
    expect(await serviceProcessIdentity(child)).toBeUndefined()
  }
  finally {
    if (existsSync(directory)) await stopNativeService(state)
  }
})

test('stops an admitted launch before foreground readiness within the existing shutdown budget', async () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-stop-during-admission-')))
  const state: NativeServiceState = { name: 'typesense', directory, owner: claimServiceDirectory(directory), binDir: directory, libraries: {} }
  try {
    await spawnNativeService(state, process.execPath, ['-e', 'setInterval(() => {}, 1000)', directory], process.env)
    await stopNativeService(state)
    expect(await serviceProcessIdentity(state.pid!)).toBeUndefined()
    expect(existsSync(directory)).toBe(false)
  }
  finally {
    if (existsSync(directory)) await stopNativeService(state)
  }
}, 25_000)

test('a failed ownership checkpoint starts no service and closes its gated launcher', async () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-checkpoint-failure-')))
  const marker = join(directory, 'service-started')
  const state: NativeServiceState = { name: 'typesense', directory, owner: claimServiceDirectory(directory), binDir: directory, libraries: {} }
  try {
    await expect(spawnNativeService(state, process.execPath, [
      '-e', 'require("node:fs").writeFileSync(process.argv[1], "started"); setInterval(() => {}, 1000)', marker, directory,
    ], process.env, () => { throw new Error('Ownership store unavailable') })).rejects.toThrow('Ownership store unavailable')
    expect(existsSync(marker)).toBe(false)
    expect(state.process).toBeDefined()
    expect(await serviceProcessIdentity(state.pid!)).toBeUndefined()
    await stopNativeService(state)
    expect(existsSync(directory)).toBe(false)
  }
  finally {
    if (existsSync(directory)) await stopNativeService(state)
  }
})

test('cleanup observes short-lived owned groups through kernel exit transitions', async () => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const directory = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-exit-transition-')))
    const state: NativeServiceState = { name: 'typesense', directory, owner: claimServiceDirectory(directory), binDir: directory, libraries: {} }
    try {
      await spawnNativeService(state, process.execPath, ['-e', 'setInterval(() => {}, 1000)', directory], process.env)
      expect(state.process?.group).toBe(state.pid)
      expect(await assertServiceProcess(state.process!, directory)).toBe(true)
      process.kill(-state.process!.group, 'SIGTERM')
      await stopNativeService(state)
      expect(await serviceProcessIdentity(state.pid!)).toBeUndefined()
      expect(existsSync(directory)).toBe(false)
    }
    finally {
      if (existsSync(directory)) await stopNativeService(state)
    }
  }
}, 25_000)

test('forced service cleanup waits for its child to exit before removing private data', async () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-force-stop-')))
  const marker = join(directory, 'child-ready')
  const state: NativeServiceState = { name: 'typesense', directory, owner: claimServiceDirectory(directory), binDir: directory, libraries: {} }
  try {
    await spawnNativeService(state, process.execPath, [
      '-e', 'process.on("SIGTERM", () => {}); require("node:fs").writeFileSync(process.argv[1], String(process.pid)); setInterval(() => {}, 1000)', marker, directory,
    ], process.env)
    const deadline = Date.now() + 3000
    while (!existsSync(marker) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 25))
    expect(existsSync(marker)).toBe(true)
    const child = Number(readFileSync(marker, 'utf8'))
    expect(await serviceProcessIdentity(child)).toBeDefined()
    await stopNativeService(state)
    expect(await serviceProcessIdentity(child)).toBeUndefined()
    expect(existsSync(directory)).toBe(false)
  }
  finally {
    if (existsSync(directory)) await stopNativeService(state)
  }
}, 25_000)
