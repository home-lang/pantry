import { execSync } from 'node:child_process'
import { describe, expect, test } from 'bun:test'
import { PantryService } from '../src/testing/service'

/** Check whether `pantry start` can work (needs launchd/systemd) */
function canManageServices(): boolean {
  // CI environments (GitHub Actions, etc.) lack a service manager bus
  if (process.env.CI || process.env.GITHUB_ACTIONS) return false
  try {
    execSync('pantry inspect postgres', { stdio: 'pipe', timeout: 5000 })
    return true
  }
  catch {
    return false
  }
}

const hasServiceManager = canManageServices()
const serviceTest = hasServiceManager ? test : test.skip

describe('PantryService', () => {
  test('isAvailable returns true when pantry is installed', () => {
    expect(PantryService.isAvailable()).toBe(true)
  })

  test('status returns info for postgres', () => {
    const svc = new PantryService({ name: 'postgres' })
    const status = svc.status()
    expect(status.name).toBe('postgres')
    expect(typeof status.running).toBe('boolean')
  })

  serviceTest('can start and stop postgres', async () => {
    const svc = new PantryService({ name: 'postgres', quiet: true })
    const wasRunning = svc.isRunning()

    const status = await svc.ensureRunning()
    expect(status.running).toBe(true)
    expect(status.port).toBe(5432)

    // Only stop if we started it
    if (!wasRunning) {
      await svc.stop()
      // Give launchd a moment
      await new Promise(r => setTimeout(r, 500))
    }
  })

  serviceTest('ensureRunning is idempotent', async () => {
    const svc = new PantryService({ name: 'postgres', quiet: true })
    const s1 = await svc.ensureRunning()
    const s2 = await svc.ensureRunning()
    expect(s1.port).toBe(s2.port)
    await svc.stop()
  })

  test('status returns not running for unknown service', () => {
    const svc = new PantryService({ name: 'nonexistent-service-xyz' })
    const status = svc.status()
    expect(status.running).toBe(false)
  })
})
