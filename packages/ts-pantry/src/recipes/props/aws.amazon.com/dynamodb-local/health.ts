import { execFileSync } from 'node:child_process'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { closeSync, mkdtempSync, openSync, readFileSync, readdirSync, readlinkSync, rmSync } from 'node:fs'
import { Agent, request } from 'node:http'
import { connect, createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [launcher, version] = process.argv.slice(2)
if (!launcher || !version || process.platform !== 'linux') throw new Error('Native DynamoDB health requires a Linux launcher and exact version')
const deadline = Date.now() + 24_000
const remaining = () => Math.max(1, Math.min(1000, deadline - Date.now()))
const root = mkdtempSync(join(tmpdir(), 'pantry-dynamodb-health-'))
const logPath = join(root, 'server.log')
const log = openSync(logPath, 'wx', 0o600)
let child: ReturnType<typeof Bun.spawn> | undefined
let passed = false

async function bounded<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    // eslint-disable-next-line pickier/no-unused-vars
    return await Promise.race([promise, new Promise<never>((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Native DynamoDB health deadline exceeded')), milliseconds)
    })])
  }
  finally {
    clearTimeout(timer)
  }
}

// A reservation chooses a free port. Before any HTTP bytes are sent, prove the
// accepted TCP connection belongs to the exact Java child, closing the race
// between releasing that reservation and Java binding its listener.
async function ownedSocket(port: number, pid: number) {
  const socket = connect({ host: '127.0.0.1', port })
  socket.setTimeout(remaining(), () => socket.destroy(new Error('Native DynamoDB socket timeout')))
  try {
    await bounded(new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve)
      socket.once('error', reject)
    }), remaining())
    const inodes = new Set<string>()
    for (const fd of readdirSync(`/proc/${pid}/fd`)) {
      try {
        const match = /^socket:\[(\d+)\]$/.exec(readlinkSync(`/proc/${pid}/fd/${fd}`))
        if (match) inodes.add(match[1]!)
      }
      catch { /* Java may close an unrelated descriptor while it is sampled. */ }
    }
    const owned = ['tcp', 'tcp6'].some(protocol => readFileSync(`/proc/net/${protocol}`, 'utf8').split('\n').some(line => {
      const fields = line.trim().split(/\s+/)
      return fields[3] === '01'
        && Number.parseInt(fields[1]?.split(':')[1] || '', 16) === port
        && Number.parseInt(fields[2]?.split(':')[1] || '', 16) === socket.localPort
        && inodes.has(fields[9] || '')
    }))
    if (!owned) throw new Error('DynamoDB accepted connection is not owned by the health-check child')
    return socket
  }
  catch (error) {
    socket.destroy()
    throw error
  }
}

const hash = (value: string) => createHash('sha256').update(value).digest('hex')
const hmac = (key: string | Buffer, value: string) => createHmac('sha256', key).update(value).digest()

async function api(port: number, operation: string, payload: Record<string, unknown> = {}): Promise<Record<string, any>> {
  if (!child || child.exitCode !== null || Date.now() >= deadline) throw new Error('Native DynamoDB child stopped or health deadline expired')
  const socket = await ownedSocket(port, child.pid)
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
  const signed = Object.keys(headers).join(';')
  const canonicalHeaders = Object.entries(headers).map(([key, value]) => `${key}:${value}\n`).join('')
  const canonical = `POST\n/\n\n${canonicalHeaders}\n${signed}\n${hash(body)}`
  const key = hmac(hmac(hmac(hmac('AWS4PantryLocalSecret', date.slice(0, 8)), 'us-east-1'), 'dynamodb'), 'aws4_request')
  const signature = hmac(key, `AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).toString('hex')
  try {
    return await bounded(new Promise((resolve, reject) => {
      const req = request({ host: '127.0.0.1', port, method: 'POST', path: '/', agent, headers: {
        ...headers,
        'content-length': Buffer.byteLength(body),
        'authorization': `AWS4-HMAC-SHA256 Credential=PantryLocalOnly/${scope}, SignedHeaders=${signed}, Signature=${signature}`,
      } }, response => {
        const chunks: Buffer[] = []
        let bytes = 0
        response.on('data', (chunk: Buffer) => {
          bytes += chunk.length
          if (bytes > 64 * 1024) response.destroy(new Error('Oversized native DynamoDB response'))
          else chunks.push(chunk)
        })
        response.once('error', reject)
        response.once('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          if (response.statusCode !== 200) reject(new Error(`${operation} returned HTTP ${response.statusCode}: ${text}`))
          else {
            try { resolve(JSON.parse(text)) }
            catch (error) { reject(error) }
          }
        })
      })
      req.once('error', reject)
      req.end(body)
    }), remaining())
  }
  finally {
    agent.destroy()
    socket.destroy()
  }
}

try {
  const actualVersion = execFileSync(launcher, ['-version'], { encoding: 'utf8', timeout: 3000 }).trim()
  if (!actualVersion.includes(version)) throw new Error(`DynamoDB version mismatch: ${actualVersion}`)
  const reservation = createServer()
  await new Promise<void>((resolve, reject) => {
    reservation.once('error', reject)
    reservation.listen(0, '127.0.0.1', resolve)
  })
  const address = reservation.address()
  if (!address || typeof address === 'string') throw new Error('Missing DynamoDB health port')
  const port = address.port
  await new Promise<void>((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()))
  child = Bun.spawn([launcher, '-port', String(port), '-dbPath', root, '-sharedDb', '-disableTelemetry'], {
    cwd: root,
    stdout: log,
    stderr: log,
    env: { ...process.env, AWS_ACCESS_KEY_ID: 'PantryLocalOnly', AWS_SECRET_ACCESS_KEY: 'PantryLocalSecret', AWS_SESSION_TOKEN: '', AWS_REGION: 'us-east-1', AWS_EC2_METADATA_DISABLED: 'true' },
  })
  let lastError: unknown
  let ready = false
  while (Date.now() < deadline - 5000 && child.exitCode === null) {
    try {
      const tables = await api(port, 'ListTables')
      if (!Array.isArray(tables.TableNames)) throw new Error('ListTables omitted TableNames')
      ready = true
      break
    }
    catch (error) { lastError = error }
    await Bun.sleep(100)
  }
  if (!ready) throw new Error(`Native DynamoDB did not become ready: ${String(lastError)}`)
  const table = `PantryHealth${randomUUID().replaceAll('-', '')}`
  await api(port, 'CreateTable', { TableName: table, AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }], KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], BillingMode: 'PAY_PER_REQUEST' })
  let active = false
  while (Date.now() < deadline - 2000) {
    const description = await api(port, 'DescribeTable', { TableName: table })
    if (description.Table?.TableStatus === 'ACTIVE') {
      active = true
      break
    }
    await Bun.sleep(50)
  }
  if (!active) throw new Error('Native DynamoDB table did not become ACTIVE')
  const item = { id: { S: 'owned-health-check' }, value: { S: randomUUID() } }
  await api(port, 'PutItem', { TableName: table, Item: item })
  const read = await api(port, 'GetItem', { TableName: table, Key: { id: item.id }, ConsistentRead: true })
  if (JSON.stringify(read.Item?.value) !== JSON.stringify(item.value)) throw new Error('Native DynamoDB did not preserve the written item')
  await api(port, 'DeleteTable', { TableName: table })
  const final = await api(port, 'ListTables')
  if (!Array.isArray(final.TableNames) || final.TableNames.includes(table)) throw new Error('Native DynamoDB did not delete the owned health table')
  passed = true
}
finally {
  try {
    if (child) {
      if (child.exitCode === null) child.kill('SIGTERM')
      try { await bounded(child.exited, 1500) }
      catch {
        if (child.exitCode === null) child.kill('SIGKILL')
        await bounded(child.exited, 1500)
      }
    }
  }
  finally {
    closeSync(log)
    if (!passed) console.error(readFileSync(logPath, 'utf8').slice(-12_000))
    // Never remove a directory still used by an unreaped process.
    if (!child || child.exitCode !== null) rmSync(root, { recursive: true, force: true })
  }
}
console.log(`PASS native DynamoDB Local ${version}: owned process, ListTables, CreateTable, PutItem, GetItem, DeleteTable, and child reaped`)
