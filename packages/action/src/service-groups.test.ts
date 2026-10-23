import { expect, test } from 'bun:test'
import { spawn } from 'node:child_process'
import { parseLinuxServiceProcessStat, serviceGroupHasLiveProcesses } from './service-ownership'

function stat(comm: string, state = 'S', group = 321, birth = '9007199254740993123'): string {
  const fields = [state, '1', String(group), ...Array<string>(16).fill('0'), birth, '0']
  return `123 (${comm}) ${fields.join(' ')}\n`
}

test('Linux group observation parses complete kernel fields even with spaces, parentheses and newlines in comm', () => {
  for (const comm of ['worker', 'worker with spaces', 'nested (closing) ) worker', 'line\nbreak']) {
    expect(parseLinuxServiceProcessStat(stat(comm))).toEqual({ pid: 123, group: 321, state: 'S', birth: '9007199254740993123' })
  }
  expect(parseLinuxServiceProcessStat(stat('dead child', 'Z', 0)).state).toBe('Z')
  for (const invalid of ['', '123 (worker) S 1 321', stat('worker').replace(' 321 ', ' invalid '), stat('worker', '?')])
    expect(() => parseLinuxServiceProcessStat(invalid)).toThrow('Linux native service')
})

test.skipIf(process.platform === 'win32')('native group observation finds a live owned group and kernel-proven absence after its exit', async () => {
  const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { detached: true, stdio: 'ignore' })
  const exit = new Promise<void>((resolve, reject) => { child.once('exit', () => resolve()); child.once('error', reject) })
  try {
    await new Promise<void>((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject) })
    expect(await serviceGroupHasLiveProcesses(child.pid!)).toBe(true)
    child.kill('SIGTERM')
    await exit
    expect(await serviceGroupHasLiveProcesses(child.pid!)).toBe(false)
  }
  finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    await exit
  }
})

test('invalid service groups never authorize process observation', async () => {
  for (const group of [0, 1, -1, 1.5, Number.NaN])
    await expect(serviceGroupHasLiveProcesses(group)).rejects.toThrow('Invalid native service process group')
})
