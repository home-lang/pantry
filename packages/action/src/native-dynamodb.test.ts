import { expect, test } from 'bun:test'
import { existsSync, mkdtempSync, realpathSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { requestNativeDynamodb } from './native-dynamodb'
import { spawnNativeService, stopNativeService } from './native-services'
import type { NativeServiceState } from './native-services'
import { claimServiceDirectory, serviceProcessIdentity } from './service-ownership'

test('DynamoDB sends no HTTP bytes to a listener outside its owned service group', async () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-dynamo-foreign-')))
  const state: NativeServiceState = { name: 'dynamodb', directory, owner: claimServiceDirectory(directory), binDir: directory, libraries: {} }
  let requests = 0
  const foreign = createServer((request, response) => {
    requests++
    request.resume()
    response.end('{}')
  })
  try {
    await new Promise<void>((resolve, reject) => {
      foreign.once('error', reject)
      foreign.listen(0, '127.0.0.1', resolve)
    })
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
    expect(requests).toBe(0)
  }
  finally {
    foreign.closeAllConnections()
    await new Promise<void>((resolve, reject) => foreign.close(error => error ? reject(error) : resolve()))
    if (existsSync(directory)) await stopNativeService(state)
  }
  expect(existsSync(directory)).toBe(false)
})
