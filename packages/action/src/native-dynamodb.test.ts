import { expect, test } from 'bun:test'
import { existsSync, mkdtempSync, realpathSync } from 'node:fs'
import { createServer } from 'node:net'
import type { Socket } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requestNativeDynamodb } from './native-dynamodb'
import { spawnNativeService, stopNativeService } from './native-services'
import type { NativeServiceState } from './native-services'
import { claimServiceDirectory, serviceProcessIdentity } from './service-ownership'

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
      await spawnNativeService(state, process.execPath, ['-e', 'setInterval(() => {}, 1000)', directory], process.env)
      await expect(requestNativeDynamodb(state, address.port, 'CreateTable', { TableName: 'Foreign' }, 200)).rejects.toThrow('not owned')
      expect(await serviceProcessIdentity(state.pid!)).toEqual(state.process)
    }
    else {
      await expect(requestNativeDynamodb(state, address.port, 'CreateTable')).rejects.toThrow('Linux process ownership')
    }
    expect(receivedBytes).toBe(0)
  }
  finally {
    try {
      for (const socket of connections) socket.destroy()
      if (listening) await new Promise<void>((resolve, reject) => foreign.close(error => error ? reject(error) : resolve()))
    }
    finally {
      if (existsSync(directory)) await stopNativeService(state)
    }
  }
  expect(existsSync(directory)).toBe(false)
})
