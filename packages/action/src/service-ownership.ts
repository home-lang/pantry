import { execFile } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { lstatSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'node:fs'
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

/** Linux stat encloses comm in parentheses; comm itself may contain spaces and parentheses. */
export function parseLinuxServiceProcessStat(stat: string): { pid: number, group: number, state: string, birth: string } {
  const open = stat.indexOf('('), close = stat.lastIndexOf(')')
  const pidText = stat.slice(0, open).trim(), fields = stat.slice(close + 1).trim().split(/\s+/)
  const pid = Number(pidText), group = Number(fields[2])
  if (open < 1 || close <= open || !/^\d+$/.test(pidText) || !Number.isSafeInteger(pid) || pid < 1
    || fields.length < 20 || !/^[a-z]$/i.test(fields[0]!) || !/^\d+$/.test(fields[2]!)
    || !Number.isSafeInteger(group) || group < 0 || !/^\d+$/.test(fields[19]!))
    throw new Error('Could not read Linux native service process state')
  return { pid, group, state: fields[0]!, birth: fields[19]! }
}

/** Observe only; this never authorizes a signal after losing the owned leader. */
export async function serviceGroupHasLiveProcesses(group: number): Promise<boolean> {
  if (!Number.isSafeInteger(group) || group <= 1) throw new Error('Invalid native service process group')
  if (process.platform !== 'linux' && process.platform !== 'darwin') throw new Error('Native service ownership requires Linux or macOS')
  const deadline = performance.now() + 2000
  try { process.kill(-group, 0) }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ESRCH') return false
    throw error
  }
  if (process.platform === 'linux') {
    // Use the same kernel interface as PID ownership. A terminated group's
    // cleanup must not depend on launching ps or enumerating its text output.
    for (const entry of readdirSync('/proc')) {
      if (!/^\d+$/.test(entry)) continue
      if (performance.now() >= deadline) throw new Error('Native service group inspection exceeded its existing two-second deadline')
      try {
        const state = parseLinuxServiceProcessStat(readFileSync(`/proc/${entry}/stat`, 'utf8'))
        if (state.group === group && state.state !== 'Z') return true
      }
      catch (error) {
        if (['ENOENT', 'ESRCH'].includes((error as NodeJS.ErrnoException).code || '')) continue
        throw error
      }
    }
    if (performance.now() >= deadline) throw new Error('Native service group inspection exceeded its existing two-second deadline')
    return false
  }
  const remaining = Math.floor(deadline - performance.now())
  if (remaining <= 0) throw new Error('Native service group inspection exceeded its existing two-second deadline')
  const { stdout } = await execute('/bin/ps', ['-axo', 'pgid=,stat='], { timeout: remaining }).catch((error) => {
    const detail = error as { code?: unknown, signal?: unknown, killed?: unknown }
    throw new Error(`Native service group inspection failed (code=${String(detail.code ?? 'unknown')}, signal=${String(detail.signal ?? 'none')}, killed=${String(detail.killed ?? false)})`, { cause: error })
  })
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue
    const match = /^\s*(\d+)\s+(\S+)\s*$/.exec(line)
    if (!match) throw new Error('Could not verify native service group shutdown')
    if (Number(match[1]) === group && !match[2]!.startsWith('Z')) return true
  }
  return false
}

/** Record kernel birth identity, user and command before detaching a service. */
export async function serviceProcessIdentity(pid: number): Promise<ServiceProcessIdentity | undefined> {
  if (!Number.isSafeInteger(pid) || pid <= 1) throw new Error('Invalid native service PID')
  if (process.platform === 'linux') {
    const directory = `/proc/${pid}`
    const snapshot = (): ReturnType<typeof parseLinuxServiceProcessStat> => {
      const parsed = parseLinuxServiceProcessStat(readFileSync(join(directory, 'stat'), 'utf8'))
      if (parsed.pid !== pid) throw new Error('Linux native service PID changed during inspection')
      return parsed
    }
    const exited = (fields: ReturnType<typeof parseLinuxServiceProcessStat>): boolean => ['Z', 'X', 'x'].includes(fields.state)
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const before = snapshot()
        if (exited(before)) return undefined
        const uid = statSync(directory).uid
        const command = readFileSync(join(directory, 'cmdline'), 'utf8').replaceAll('\0', ' ').trim()
        const after = snapshot()
        if (before.birth !== after.birth || before.group !== after.group)
          throw new Error('Native service process ownership changed while reading its identity')
        if (exited(after)) return undefined
        if (command) return { pid, uid, group: after.group, birth: after.birth, command }
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
  const deadline = Date.now() + 2000
  while (Date.now() < deadline) {
    const result = await execute('/bin/ps', ['-ww', '-p', String(pid), '-o', 'uid=,pgid=,stat=,lstart=,command='], { timeout: Math.max(1, deadline - Date.now()) }).catch((error) => {
      if (error.code === 1 && !error.stdout?.trim()) return { stdout: '' }
      throw error
    })
    const line = result.stdout.trim()
    if (!line) return undefined
    const match = /^(\d+)\s+(\d+)\s+(\S+)\s+(\w+\s+\w+\s+\d+\s+\d+:\d+:\d+\s+\d+)\s+(.+)$/.exec(line)
    if (!match) throw new Error('Could not read native service process ownership')
    if (match[3]!.startsWith('Z')) return undefined
    // Darwin can release argv before publishing zombie state. ps then exposes
    // only its parenthesized accounting name, or the E (exiting) flag. Neither
    // is a live command identity or proof of exit. Wait for a verifiable sample;
    // never authorize a signal or directory removal from this partial snapshot.
    if (!match[3]!.includes('E') && !/^\([^)]*\)$/.test(match[5]!) && match[5] !== '<exiting>')
      return { pid, uid: Number(match[1]), group: Number(match[2]), birth: match[4]!, command: match[5]! }
    await new Promise(resolve => setTimeout(resolve, 5))
  }
  throw new Error('Could not verify native service process identity; retained private data')
}

export async function assertServiceProcess(identity: ServiceProcessIdentity, directory: string): Promise<boolean> {
  const live = await serviceProcessIdentity(identity.pid)
  if (!live) return false
  const mismatch = [
    ...(live.uid !== process.getuid?.() || live.uid !== identity.uid ? ['uid'] : []),
    ...(live.group !== identity.group ? ['group'] : []),
    ...(live.birth !== identity.birth ? ['birth'] : []),
    ...(live.command !== identity.command ? ['command'] : []),
    ...(!live.command.includes(realpathSync(directory)) ? ['directory'] : []),
  ]
  if (mismatch.length)
    throw new Error(`Refusing to signal a foreign or reused native service PID (${mismatch.join(', ')})`)
  return true
}
