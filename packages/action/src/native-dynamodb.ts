import { execFile } from 'node:child_process'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { readFileSync, readdirSync, readlinkSync, realpathSync } from 'node:fs'
import { Agent, request } from 'node:http'
import { connect } from 'node:net'
import { dirname, isAbsolute, join, relative } from 'node:path'
import { promisify } from 'node:util'
import { resolveNativeExecutable } from './native-executable'
import type { NativeServiceOptions, NativeServiceState } from './native-services'
import { spawnNativeService } from './native-services'
import { assertServiceDirectory, assertServiceProcess, serviceProcessIdentity } from './service-ownership'
import type { ServiceSpec } from './services'

const execute = promisify(execFile)
const pause = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
const hmac = (key: string | Buffer, value: string) => createHmac('sha256', key).update(value).digest()

/** Prove this accepted connection belongs to the recorded launcher's live child. */
async function ownedDynamodbSocket(state: NativeServiceState, port: number, timeoutMs: number) {
  if (process.platform !== 'linux' || !state.launcher || !state.process) throw new Error('DynamoDB requires Linux process ownership')
  assertServiceDirectory(state.directory, state.owner)
  if (!await assertServiceProcess(state.process, state.directory)) throw new Error('DynamoDB launcher exited')
  const socket = connect({ host: '127.0.0.1', port })
  const deadline = Date.now() + timeoutMs
  socket.setTimeout(timeoutMs, () => socket.destroy(new Error('DynamoDB socket timeout')))
  try {
    await new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve)
      socket.once('error', reject)
    })
    while (Date.now() < deadline && !socket.destroyed) {
      if (!await assertServiceProcess(state.process, state.directory)) throw new Error('DynamoDB launcher exited')
      for (const entry of readdirSync('/proc')) {
        if (!/^\d+$/.test(entry)) continue
        try {
          const stat = readFileSync(`/proc/${entry}/stat`, 'utf8')
          if (Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[2]) !== state.process.group) continue
          const identity = await serviceProcessIdentity(Number(entry))
          if (!identity || identity.group !== state.process.group || !identity.command.includes(state.directory)) continue
          const inodes = new Set<string>()
          for (const descriptor of readdirSync(`/proc/${entry}/fd`)) {
            try {
              const inode = /^socket:\[(\d+)\]$/.exec(readlinkSync(`/proc/${entry}/fd/${descriptor}`))?.[1]
              if (inode) inodes.add(inode)
            }
            catch { /* A descriptor may close while its process remains alive. */ }
          }
          const accepted = ['tcp', 'tcp6'].some(protocol => readFileSync(`/proc/net/${protocol}`, 'utf8').split('\n').some(line => {
            const fields = line.trim().split(/\s+/)
            return fields[3] === '01'
              && Number.parseInt(fields[1]?.split(':')[1] || '', 16) === port
              && Number.parseInt(fields[2]?.split(':')[1] || '', 16) === socket.localPort
              && inodes.has(fields[9] || '')
          }))
          if (accepted && await assertServiceProcess(identity, state.directory)
            && await assertServiceProcess(state.process, state.directory)) return socket
        }
        catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        }
      }
      await pause(10)
    }
    throw new Error('DynamoDB accepted connection is not owned by this service')
  }
  catch (error) {
    socket.destroy()
    throw error
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Local-only SigV4 placeholders satisfy DynamoDB Local, which has no cloud authentication. */
export async function requestNativeDynamodb(state: NativeServiceState, port: number, operation: string, payload: Record<string, unknown> = {}, timeoutMs = 1000): Promise<Record<string, unknown>> {
  const deadline = Date.now() + timeoutMs
  const socket = await ownedDynamodbSocket(state, port, timeoutMs)
  let timeout: ReturnType<typeof setTimeout> | undefined
  const agent = new Agent({ keepAlive: false })
  agent.createConnection = () => socket
  const body = JSON.stringify(payload)
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
  const scope = `${date.slice(0, 8)}/us-east-1/dynamodb/aws4_request`
  const headers = {
    'content-type': 'application/x-amz-json-1.0',
    'host': `127.0.0.1:${port}`,
    'x-amz-date': date,
    'x-amz-target': `DynamoDB_20120810.${operation}`,
  }
  const names = Object.keys(headers).sort() as Array<keyof typeof headers>
  const canonical = names.map(name => `${name}:${headers[name]}\n`).join('')
  const signed = names.join(';')
  const signingKey = hmac(hmac(hmac(hmac('AWS4PantryLocalSecret', date.slice(0, 8)), 'us-east-1'), 'dynamodb'), 'aws4_request')
  const signature = createHmac('sha256', signingKey).update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(`POST\n/\n\n${canonical}\n${signed}\n${hash(body)}`)}`).digest('hex')
  try {
    return await new Promise((resolve, reject) => {
      const outgoing = request({ hostname: '127.0.0.1', port, method: 'POST', path: '/', agent, headers: {
        ...headers,
        'content-length': Buffer.byteLength(body),
        'authorization': `AWS4-HMAC-SHA256 Credential=PantryLocalOnly/${scope}, SignedHeaders=${signed}, Signature=${signature}`,
      } }, (incoming) => {
        const chunks: Buffer[] = []
        let bytes = 0
        incoming.on('data', (chunk: Buffer) => {
          bytes += chunk.length
          if (bytes > 1024 * 1024) incoming.destroy(new Error('DynamoDB response exceeded 1 MiB'))
          else chunks.push(chunk)
        })
        incoming.once('error', reject)
        incoming.once('end', () => {
          try {
            if (incoming.statusCode !== 200) throw new Error(`DynamoDB ${operation} returned HTTP ${incoming.statusCode}`)
            const result: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
            if (!record(result)) throw new Error('DynamoDB returned an invalid response')
            resolve(result)
          }
          catch (error) { reject(error) }
        })
      })
      outgoing.once('error', reject)
      timeout = setTimeout(() => outgoing.destroy(new Error('DynamoDB request timeout')), Math.max(1, deadline - Date.now()))
      outgoing.end(body)
    })
  }
  finally {
    clearTimeout(timeout)
    agent.destroy()
    socket.destroy()
  }
}

export async function startNativeDynamodb(service: ServiceSpec, state: NativeServiceState, env: NodeJS.ProcessEnv, port: number, onState?: NativeServiceOptions['onState']): Promise<{ state: NativeServiceState, environment: Record<string, string>, version: string }> {
  // A new registry-only provider must not appear healthy by borrowing the
  // runner image's JVM when an old installer omitted its dependency graph.
  for (const program of ['java', 'readlink', 'dirname']) {
    const executable = resolveNativeExecutable(join(state.binDir, program))
    const local = relative(realpathSync(dirname(state.binDir)), executable)
    if (isAbsolute(local) || local === '..' || local.startsWith('../'))
      throw new Error(`DynamoDB requires Pantry-managed ${program}`)
  }
  const { stdout } = await execute(join(state.binDir, 'dynamodb-local'), ['-version'], { env, timeout: 10_000 })
  const versions = stdout.match(/\b\d+\.\d+\.\d+\b/g) || []
  const version = versions.length === 1 ? versions[0] : undefined
  if (!version || (service.expectedVersion && version !== service.expectedVersion)) throw new Error(`DynamoDB version mismatch: ${stdout.trim()}`)
  await spawnNativeService(state, join(state.binDir, 'dynamodb-local'), ['-port', String(port), '-dbPath', state.directory, '-sharedDb', '-disableTelemetry'], env, onState)
  const deadline = Date.now() + 30_000
  let lastError: unknown
  let ready = false
  while (Date.now() < deadline) {
    try {
      const result = await requestNativeDynamodb(state, port, 'ListTables')
      if (!Array.isArray(result.TableNames)) throw new Error('DynamoDB omitted TableNames')
      ready = true
      break
    }
    catch (error) { lastError = error }
    await pause(100)
  }
  if (!ready) throw new Error(`DynamoDB did not become ready: ${String(lastError)}`)
  const table = `PantryHealth${randomUUID().replaceAll('-', '')}`
  await requestNativeDynamodb(state, port, 'CreateTable', { TableName: table, AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }], KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], BillingMode: 'PAY_PER_REQUEST' })
  let active = false
  while (Date.now() < deadline) {
    const result = await requestNativeDynamodb(state, port, 'DescribeTable', { TableName: table })
    if (record(result.Table) && result.Table.TableStatus === 'ACTIVE') {
      active = true
      break
    }
    await pause(50)
  }
  if (!active) throw new Error('DynamoDB health table did not become ACTIVE')
  const value = randomUUID()
  await requestNativeDynamodb(state, port, 'PutItem', { TableName: table, Item: { id: { S: 'health' }, value: { S: value } } })
  const read = await requestNativeDynamodb(state, port, 'GetItem', { TableName: table, Key: { id: { S: 'health' } }, ConsistentRead: true })
  if (!record(read.Item) || !record(read.Item.value) || read.Item.value.S !== value) throw new Error('DynamoDB did not preserve the written item')
  await requestNativeDynamodb(state, port, 'DeleteTable', { TableName: table })
  const final = await requestNativeDynamodb(state, port, 'ListTables')
  if (!Array.isArray(final.TableNames) || final.TableNames.includes(table)) throw new Error('DynamoDB did not delete the health table')
  return { state, version, environment: {
    DYNAMODB_HOST: '127.0.0.1', DYNAMODB_PORT: String(port), DYNAMODB_URL: `http://127.0.0.1:${port}`,
    DYNAMODB_SERVICE_VERSION: version, DYNAMODB_REGION: 'us-east-1',
    DYNAMODB_ACCESS_KEY_ID: 'PantryLocalOnly', DYNAMODB_SECRET_ACCESS_KEY: 'PantryLocalSecret',
  } }
}
