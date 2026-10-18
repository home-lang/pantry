import { expect, test } from 'bun:test'
import { existsSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
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

test('a different process birth or command is rejected without signalling it', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pantry-foreign-test-'))
  try {
    const identity = (await serviceProcessIdentity(process.pid))!
    expect(identity.uid).toBe(process.getuid!())
    await expect(assertServiceProcess({ ...identity, birth: 'not-this-process' }, directory)).rejects.toThrow('foreign or reused')
    await expect(assertServiceProcess({ ...identity, command: 'other-job' }, directory)).rejects.toThrow('foreign or reused')
    expect(await serviceProcessIdentity(process.pid)).toEqual(identity)
  }
  finally { rmSync(directory, { recursive: true, force: true }) }
})

test('captures and stops only its owned foreground process, then removes private data', async () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-owned-process-')))
  const state: NativeServiceState = { name: 'typesense', directory, owner: claimServiceDirectory(directory), binDir: directory, libraries: {} }
  try {
    await spawnNativeService(state, process.execPath, ['-e', 'setInterval(() => {}, 1000)', directory], process.env)
    expect(state.process?.pid).toBe(state.pid)
    expect(await assertServiceProcess(state.process!, directory)).toBe(true)
    await stopNativeService(state)
    expect(existsSync(directory)).toBe(false)
    expect(await serviceProcessIdentity(state.pid!)).toBeUndefined()
  }
  finally {
    if (existsSync(directory)) await stopNativeService(state)
  }
})
