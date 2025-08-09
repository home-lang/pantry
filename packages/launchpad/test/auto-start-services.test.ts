import type { ServiceInstance } from '../src/types'
import { describe, expect, it } from 'bun:test'
import { generateLaunchdPlist } from '../src/services/platform'

function makeServiceInstance(name: string, overrides: Partial<ServiceInstance> = {}): ServiceInstance {
  return {
    name,
    status: 'stopped',
    enabled: false,
    definition: {
      name,
      displayName: name,
      packageDomain: 'example.org',
      executable: 'dummy',
      args: [],
      dataDirectory: '/tmp',
      pidFile: '/tmp/d.pid',
      port: 1234,
      dependencies: [],
      healthCheck: { command: ['true'], expectedExitCode: 0, timeout: 1, interval: 1, retries: 1 },
    },
    ...overrides,
  } as unknown as ServiceInstance
}

describe('services.shouldAutoStart → launchd RunAtLoad', () => {
  it('RunAtLoad=false when shouldAutoStart=false', async () => {
    process.env.LAUNCHPAD_SERVICES_SHOULD_AUTOSTART = 'false'
    const svc = makeServiceInstance('redis')
    const plist = generateLaunchdPlist(svc)
    expect(plist.RunAtLoad).toBe(false)
    delete process.env.LAUNCHPAD_SERVICES_SHOULD_AUTOSTART
  })

  it('RunAtLoad=true when shouldAutoStart=true', async () => {
    process.env.LAUNCHPAD_SERVICES_SHOULD_AUTOSTART = 'true'
    const svc = makeServiceInstance('postgres')
    const plist = generateLaunchdPlist(svc)
    expect(plist.RunAtLoad).toBe(true)
    delete process.env.LAUNCHPAD_SERVICES_SHOULD_AUTOSTART
  })

  it('RunAtLoad defaults to service.enabled when shouldAutoStart not set', async () => {
    delete process.env.LAUNCHPAD_SERVICES_SHOULD_AUTOSTART
    const svc = makeServiceInstance('postgres', { enabled: true })
    const plist = generateLaunchdPlist(svc)
    expect(plist.RunAtLoad).toBe(true)
  })
})
