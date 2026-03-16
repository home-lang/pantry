import { describe, expect, test } from 'bun:test'
import { PantryService } from '../src/testing/service'

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

  test('can start and stop postgres', async () => {
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

  test('ensureRunning is idempotent', async () => {
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
