import { expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { createServer } from 'node:net'
import type { Socket } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requestNativeDynamodb } from './native-dynamodb'
import { spawnNativeService, startNativeService, stopNativeService } from './native-services'
import type { NativeServiceState } from './native-services'
import { claimServiceDirectory, serviceProcessIdentity } from './service-ownership'
import { parseServiceSpecs } from './services'

test('DynamoDB rejects an ambient JVM before launching a service', async () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-dynamo-jvm-')))
  const binaries = join(root, 'pantry', '.bin')
  mkdirSync(binaries, { recursive: true })
  symlinkSync(process.execPath, join(binaries, 'java'))
  try {
    await expect(startNativeService(parseServiceSpecs('dynamodb@3.3.0')[0]!, binaries, root)).rejects.toThrow(
      process.platform === 'linux' && process.arch === 'x64' ? 'Pantry-managed java' : 'Linux x86-64',
    )
    expect(readdirSync(root)).toEqual(['pantry'])
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('DynamoDB sends no HTTP bytes to a listener outside its owned service group', async () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-dynamo-foreign-')))
  const state: NativeServiceState = { name: 'dynamodb', directory, owner: claimServiceDirectory(directory), binDir: directory, libraries: {} }
  let receivedBytes = 0
  let listening = false
  const connections = new Set<Socket>()
  const foreign = createServer((socket) => {
    connections.add(socket)
    socket.on('data', (data) => { receivedBytes += data.length })
    socket.once('close', () => connections.delete(socket))
  })
  try {
    await new Promise<void>((resolve, reject) => {
      foreign.once('error', reject)
      foreign.listen(0, '127.0.0.1', resolve)
    })
    listening = true
    const address = foreign.address()
    if (!address || typeof address === 'string') throw new Error('Foreign test listener has no port')
    if (process.platform === 'linux') {
      const ready = join(directory, 'child-ready')
      console.log('foreign-listener fixture: admitting owned launcher')
      await spawnNativeService(state, process.execPath, [
        '-e', 'process.on("SIGTERM", () => process.exit(143)); require("node:fs").writeFileSync(process.argv[1], "ready"); setInterval(() => {}, 1000)', ready, directory,
      ], process.env)
      console.log('foreign-listener fixture: launcher admitted')
      const deadline = Date.now() + 3000
      while (!existsSync(ready) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10))
      expect(existsSync(ready)).toBe(true)
      console.log('foreign-listener fixture: foreground ready; checking foreign listener')
      await expect(requestNativeDynamodb(state, address.port, 'CreateTable', { TableName: 'Foreign' }, 200)).rejects.toThrow('not owned')
      console.log('foreign-listener fixture: foreign listener rejected')
      expect(await serviceProcessIdentity(state.pid!)).toEqual(state.process)
    }
    else {
      await expect(requestNativeDynamodb(state, address.port, 'CreateTable')).rejects.toThrow('Linux process ownership')
    }
    expect(receivedBytes).toBe(0)
  }
  finally {
    try {
      console.log('foreign-listener fixture: closing foreign listener')
      for (const socket of connections) socket.destroy()
      if (listening) await new Promise<void>((resolve, reject) => foreign.close(error => error ? reject(error) : resolve()))
      console.log('foreign-listener fixture: foreign listener closed')
    }
    finally {
      console.log('foreign-listener fixture: stopping owned launcher')
      if (existsSync(directory)) await stopNativeService(state)
      console.log('foreign-listener fixture: owned launcher stopped')
    }
  }
  expect(existsSync(directory)).toBe(false)
// Admission, foreground readiness and owned shutdown have independent budgets;
// the foreign-listener request itself still has its original 200ms deadline.
}, 25_000)
