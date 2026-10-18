import { execFile } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { lstatSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execute = promisify(execFile)

export interface ServiceProcessIdentity {
  pid: number
  uid: number
  group: number
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
    const directory = `/proc/${pid}`
    const snapshot = (): string[] => {
      const fields = readFileSync(join(directory, 'stat'), 'utf8')
      return fields.slice(fields.lastIndexOf(')') + 2).split(' ')
    }
    const exited = (fields: string[]): boolean => ['Z', 'X', 'x'].includes(fields[0]!)
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const before = snapshot()
        if (exited(before)) return undefined
        const uid = statSync(directory).uid
        const command = readFileSync(join(directory, 'cmdline'), 'utf8').replaceAll('\0', ' ').trim()
        const after = snapshot()
        if (before[19] !== after[19] || before[2] !== after[2])
          throw new Error('Native service process ownership changed while reading its identity')
        if (exited(after)) return undefined
        if (command) return { pid, uid, group: Number(after[2]), birth: after[19]!, command }
        // Linux clears the address space before publishing zombie state. An
        // empty cmdline between those events is not a different live command
        // and is not proof of exit. Resample until the kernel proves either;
        // a persistently unverifiable process still fails closed.
        await new Promise(resolve => setTimeout(resolve, 5))
      }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
        throw error
      }
    }
    throw new Error('Could not verify native service process identity; retained private data')
  }
  if (process.platform !== 'darwin') throw new Error('Native service ownership requires Linux or macOS')
  const result = await execute('/bin/ps', ['-p', String(pid), '-o', 'uid=,pgid=,stat=,lstart=,command='], { timeout: 2000 }).catch((error) => {
    if (error.code === 1 && !error.stdout?.trim()) return { stdout: '' }
    throw error
  })
  const line = result.stdout.trim()
  if (!line) return undefined
  const match = /^(\d+)\s+(\d+)\s+(\S+)\s+(\w+\s+\w+\s+\d+\s+\d+:\d+:\d+\s+\d+)\s+(.+)$/.exec(line)
  if (!match) throw new Error('Could not read native service process ownership')
  if (match[3]!.startsWith('Z')) return undefined
  return { pid, uid: Number(match[1]), group: Number(match[2]), birth: match[4]!, command: match[5]! }
}

export async function assertServiceProcess(identity: ServiceProcessIdentity, directory: string): Promise<boolean> {
  const live = await serviceProcessIdentity(identity.pid)
  if (!live) return false
  if (live.uid !== process.getuid?.() || live.uid !== identity.uid || live.group !== identity.group || live.birth !== identity.birth
    || live.command !== identity.command || !live.command.includes(realpathSync(directory)))
    throw new Error('Refusing to signal a foreign or reused native service PID')
  return true
}
