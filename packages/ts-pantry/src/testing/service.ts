/**
 * Generic pantry service lifecycle manager.
 *
 * Wraps the `pantry` CLI to start/stop/inspect services programmatically.
 * Tracks started services and cleans them up on process exit.
 */
import { execSync, type ExecSyncOptions } from 'node:child_process'

export interface ServiceConfig {
  /** Service name as known by pantry (e.g. 'postgres', 'redis', 'mysql') */
  name: string
  /** Port to check for readiness (optional — uses pantry inspect to detect) */
  port?: number
  /** Max milliseconds to wait for the service to become healthy */
  readyTimeoutMs?: number
  /** Polling interval in ms when waiting for readiness */
  pollIntervalMs?: number
  /** If true, suppress pantry CLI output */
  quiet?: boolean
}

export interface ServiceStatus {
  name: string
  running: boolean
  port: number | null
  pid: number | null
  dataDir: string | null
}

const startedServices = new Set<string>()
let cleanupRegistered = false

function registerCleanup(): void {
  if (cleanupRegistered) return
  cleanupRegistered = true

  const cleanup = () => {
    for (const name of startedServices) {
      try {
        execSync(`pantry stop ${name}`, { stdio: 'ignore', timeout: 10000 })
      }
      catch {
        // Best-effort on exit
      }
    }
    startedServices.clear()
  }

  process.on('exit', cleanup)
  process.on('SIGINT', () => { cleanup(); process.exit(130) })
  process.on('SIGTERM', () => { cleanup(); process.exit(143) })
}

function pantryExec(cmd: string, quiet = false): string {
  const opts: ExecSyncOptions = {
    encoding: 'utf-8',
    timeout: 30000,
    stdio: quiet ? 'pipe' : ['pipe', 'pipe', 'pipe'],
  }
  return execSync(`pantry ${cmd}`, opts) as string
}

function parsePantryInspect(output: string): ServiceStatus {
  const name = output.match(/Name:\s+(\S+)/)?.[1] ?? ''
  const running = /Status:\s+running/i.test(output)
  const portMatch = output.match(/Port:\s+(\d+)/)
  const pidMatch = output.match(/PID:\s+(\d+)/)
  const dataDirMatch = output.match(/Data Dir:\s+(.+)/)

  return {
    name,
    running,
    port: portMatch ? Number.parseInt(portMatch[1], 10) : null,
    pid: pidMatch ? Number.parseInt(pidMatch[1], 10) : null,
    dataDir: dataDirMatch ? dataDirMatch[1].trim() : null,
  }
}

/**
 * Pantry service lifecycle manager.
 *
 * @example
 * ```ts
 * const pg = new PantryService({ name: 'postgres' })
 * await pg.ensureRunning()
 * console.log(pg.status()) // { running: true, port: 5432, ... }
 * await pg.stop()
 * ```
 */
export class PantryService {
  private config: Required<ServiceConfig>
  private _startedByUs = false

  constructor(config: ServiceConfig) {
    this.config = {
      name: config.name,
      port: config.port ?? 0,
      readyTimeoutMs: config.readyTimeoutMs ?? 15000,
      pollIntervalMs: config.pollIntervalMs ?? 200,
      quiet: config.quiet ?? true,
    }
  }

  /** Check if the pantry CLI is available */
  static isAvailable(): boolean {
    try {
      execSync('pantry --version', { stdio: 'ignore', timeout: 5000 })
      return true
    }
    catch {
      return false
    }
  }

  /** Get current service status via `pantry inspect` */
  status(): ServiceStatus {
    try {
      const output = pantryExec(`inspect ${this.config.name}`, true)
      return parsePantryInspect(output)
    }
    catch {
      return { name: this.config.name, running: false, port: null, pid: null, dataDir: null }
    }
  }

  /** Check if the service is currently running */
  isRunning(): boolean {
    return this.status().running
  }

  /** Get the port the service is listening on */
  getPort(): number | null {
    return this.status().port
  }

  /**
   * Start the service via `pantry start`.
   * No-op if already running.
   */
  async start(): Promise<ServiceStatus> {
    registerCleanup()

    if (this.isRunning()) {
      return this.status()
    }

    pantryExec(`start ${this.config.name}`, this.config.quiet)
    this._startedByUs = true
    startedServices.add(this.config.name)

    // Wait for service to become ready
    await this.waitReady()

    return this.status()
  }

  /**
   * Stop the service via `pantry stop`.
   * Only stops if we started it (won't kill a pre-existing service).
   */
  async stop(): Promise<void> {
    if (!this._startedByUs) return

    try {
      pantryExec(`stop ${this.config.name}`, this.config.quiet)
    }
    catch {
      // Service may already be stopped
    }

    startedServices.delete(this.config.name)
    this._startedByUs = false
  }

  /**
   * Force stop regardless of who started it.
   */
  async forceStop(): Promise<void> {
    try {
      pantryExec(`stop ${this.config.name}`, this.config.quiet)
    }
    catch {
      // Ignore
    }
    startedServices.delete(this.config.name)
    this._startedByUs = false
  }

  /**
   * Ensure the service is running. Starts it if not.
   * Returns connection info.
   */
  async ensureRunning(): Promise<ServiceStatus> {
    if (this.isRunning()) return this.status()
    return this.start()
  }

  /**
   * Wait for the service to become healthy (port responding).
   */
  private async waitReady(): Promise<void> {
    const deadline = Date.now() + this.config.readyTimeoutMs
    while (Date.now() < deadline) {
      if (this.isRunning()) return
      await new Promise(r => setTimeout(r, this.config.pollIntervalMs))
    }
    throw new Error(`Service '${this.config.name}' did not become ready within ${this.config.readyTimeoutMs}ms`)
  }
}
