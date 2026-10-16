import * as fs from 'node:fs'
import * as path from 'node:path'

export interface ServiceSpec {
  name: 'redis' | 'postgres' | 'typesense'
  packageSpec: string
  expectedVersion?: string
}

export function parseServiceSpecs(input: string): ServiceSpec[] {
  const services: ServiceSpec[] = []
  const seen = new Set<string>()
  for (const raw of input.split(/[\s,]+/).filter(Boolean)) {
    if (raw.split('@').length > 2) throw new Error(`Invalid Pantry Action service: ${raw}`)
    const [requested, version] = raw.split('@')
    const name = requested === 'postgresql' || requested === 'postgresql.org' ? 'postgres' : requested === 'typesense.org' ? 'typesense' : requested
    if (name !== 'redis' && name !== 'postgres' && name !== 'typesense') throw new Error(`Unsupported Pantry Action service: ${name}`)
    if (seen.has(name)) throw new Error(`Duplicate Pantry Action service: ${name}`)
    if (version !== undefined && !(name === 'redis' ? /^\d+\.\d+\.\d+$/ : /^\d+\.\d+(?:\.\d+)?$/).test(version))
      throw new Error(`Service versions must be exact semantic versions: ${raw}`)
    seen.add(name)
    const domain = name === 'postgres' ? 'postgresql.org' : name === 'typesense' ? 'typesense.org' : 'redis'
    services.push({ name, packageSpec: version ? `${domain}@${version}` : domain, expectedVersion: version })
  }
  return services
}

export function mergeServicePackages(packages: string, services: ServiceSpec[]): string {
  const requested = packages.split(/\s+/).filter(Boolean)
  for (const service of services) {
    const existing = requested.find(spec => [service.name, service.packageSpec.split('@')[0]].includes(spec.split('@')[0]))
    if (existing && existing.split('@')[1] !== service.expectedVersion)
      throw new Error(`Conflicting package and service versions for ${service.name}: ${existing} vs ${service.packageSpec}`)
    if (!existing) requested.push(service.packageSpec)
  }
  return requested.join(' ')
}

export function pantryLibraryPaths(pantryBinDir: string): string[] {
  const pantryRoot = path.dirname(pantryBinDir)
  const libraries: string[] = []
  const seen = new Set<string>()

  const visit = (directory: string, depth: number): void => {
    if (depth > 5) return
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true })
    }
    catch {
      return
    }
    entries.sort((left, right) => left.name.localeCompare(right.name))

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue
      const child = path.join(directory, entry.name)
      if (/^v\d/.test(entry.name)) {
        const libraryDirectory = path.join(child, 'lib')
        if (fs.existsSync(libraryDirectory) && !seen.has(libraryDirectory)) {
          seen.add(libraryDirectory)
          libraries.push(libraryDirectory)
        }
        continue
      }
      visit(child, depth + 1)
    }
  }

  visit(pantryRoot, 0)
  return libraries
}

export function nativeServiceEnvironment(
  pantryBinDir: string,
  platform: 'darwin' | 'linux' | 'windows',
  baseEnvironment: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const environment = Object.fromEntries(
    Object.entries(baseEnvironment).filter((entry): entry is [string, string] => entry[1] !== undefined),
  )
  if (platform === 'windows') return environment

  const variable = platform === 'darwin' ? 'DYLD_LIBRARY_PATH' : 'LD_LIBRARY_PATH'
  const value = [...new Set([...pantryLibraryPaths(pantryBinDir), ...(environment[variable]?.split(path.delimiter) || [])].filter(Boolean))].join(path.delimiter)
  if (value) environment[variable] = value
  return environment
}

export function redisLaunchArgs(tempDir: string, port = 6379): string[] {
  const serviceDir = path.join(tempDir, 'pantry-services', 'redis')
  return [
    '--bind', '127.0.0.1',
    '--port', String(port),
    '--protected-mode', 'yes',
    '--save', '',
    '--appendonly', 'no',
    '--daemonize', 'yes',
    '--dir', serviceDir,
    '--pidfile', path.join(serviceDir, 'redis.pid'),
    '--logfile', path.join(serviceDir, 'redis.log'),
  ]
}

export function readRedisPid(pidfile: string): number {
  if (!fs.existsSync(pidfile)) throw new Error(`Redis did not create its pidfile: ${pidfile}`)
  const pid = Number.parseInt(fs.readFileSync(pidfile, 'utf8').trim(), 10)
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error(`Redis wrote an invalid pidfile: ${pidfile}`)
  try {
    process.kill(pid, 0)
  }
  catch {
    throw new Error(`Redis process ${pid} is not running`)
  }
  return pid
}

export async function waitForRedisPid(
  pidfile: string,
  options: { timeoutMs?: number, intervalMs?: number } = {},
): Promise<number> {
  const timeoutMs = options.timeoutMs ?? 10_000
  const intervalMs = options.intervalMs ?? 100
  const deadline = Date.now() + timeoutMs
  let lastError: unknown

  do {
    try {
      return readRedisPid(pidfile)
    }
    catch (error) {
      lastError = error
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  } while (Date.now() < deadline)

  const detail = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(`Redis pid did not become ready within ${timeoutMs}ms: ${detail}`)
}

export function readServiceLog(logfile: string): string {
  if (!fs.existsSync(logfile)) return 'Redis did not create a logfile'
  const content = fs.readFileSync(logfile, 'utf8').trim()
  return content || 'Redis logfile was empty'
}

export function parseRedisVersion(output: string): string {
  const match = output.match(/\bv=(\d+\.\d+\.\d+)\b/)
  if (!match) throw new Error(`Could not determine Redis version from: ${output.trim()}`)
  return match[1]
}
