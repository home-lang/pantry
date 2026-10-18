import { execFile } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { lstatSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execute = promisify(execFile)

export interface ServiceProcessIdentity {
  pid: number
  uid: number
  birth: string
  command: string
}

/** A private directory marker also prevents cleanup of unrelated action data. */
export function claimServiceDirectory(directory: string): string {
  const owner = randomBytes(24).toString('hex')
  writeFileSync(join(directory, '.pantry-service-owner'), owner, { mode: 0o600, flag: 'wx' })
  return owner
}

export function assertServiceDirectory(directory: string, owner: string): void {
  const metadata = lstatSync(directory)
  if (!owner || !metadata.isDirectory() || metadata.isSymbolicLink()
    || metadata.uid !== process.getuid?.()
    || readFileSync(join(directory, '.pantry-service-owner'), 'utf8') !== owner)
    throw new Error('Refusing cleanup of an unowned Pantry service directory')
}

/** Record kernel birth identity, user and command before detaching a service. */
export async function serviceProcessIdentity(pid: number): Promise<ServiceProcessIdentity | undefined> {
  if (!Number.isSafeInteger(pid) || pid <= 1) throw new Error('Invalid native service PID')
  if (process.platform === 'linux') {
    try {
      const directory = `/proc/${pid}`
      const fields = readFileSync(join(directory, 'stat'), 'utf8')
      const trailing = fields.slice(fields.lastIndexOf(')') + 2).split(' ')
      // A zombie has exited and cannot be signalled as a running service.
      if (trailing[0] === 'Z') return undefined
      return {
        pid, uid: statSync(directory).uid,
        birth: trailing[19]!,
        command: readFileSync(join(directory, 'cmdline'), 'utf8').replaceAll('\0', ' ').trim(),
      }
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
      throw error
    }
  }
  if (process.platform !== 'darwin') throw new Error('Native service ownership requires Linux or macOS')
  const result = await execute('/bin/ps', ['-p', String(pid), '-o', 'uid=,lstart=,command='], { timeout: 2000 }).catch((error) => {
    if (error.code === 1 && !error.stdout?.trim()) return { stdout: '' }
    throw error
  })
  const line = result.stdout.trim()
  if (!line) return undefined
  const match = /^(\d+)\s+(\w+\s+\w+\s+\d+\s+\d+:\d+:\d+\s+\d+)\s+(.+)$/.exec(line)
  if (!match) throw new Error('Could not read native service process ownership')
  return { pid, uid: Number(match[1]), birth: match[2]!, command: match[3]! }
}

export async function assertServiceProcess(identity: ServiceProcessIdentity, directory: string): Promise<boolean> {
  const live = await serviceProcessIdentity(identity.pid)
  if (!live) return false
  if (live.uid !== process.getuid?.() || live.uid !== identity.uid || live.birth !== identity.birth
    || live.command !== identity.command || !live.command.includes(realpathSync(directory)))
    throw new Error('Refusing to signal a foreign or reused native service PID')
  return true
}
