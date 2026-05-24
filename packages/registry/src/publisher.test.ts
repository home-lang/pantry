import { describe, expect, test, beforeEach } from 'bun:test'
import { createLocalRegistry } from './registry'
import { AuthService, InMemoryAuthStorage } from './auth'

describe('Publisher dashboard', () => {
  let registry: ReturnType<typeof createLocalRegistry>
  let auth: AuthService

  beforeEach(() => {
    registry = createLocalRegistry()
    auth = new AuthService(new InMemoryAuthStorage())
  })

  test('publish assigns ownership and lists packages', async () => {
    await auth.signup('pub@test.com', 'Publisher', 'password12345')
    const { sessionToken } = await auth.login('pub@test.com', 'password12345')
    const tokens = await auth.createApiToken('pub@test.com', 'ci', ['publish'])
    expect(tokens.token).toStartWith('ptry_')

    const tarball = new ArrayBuffer(8)
    await registry.publish({
      name: 'my-dashboard-pkg',
      version: '1.0.0',
      description: 'Test package',
      publishedAt: new Date().toISOString(),
    }, tarball, 'pub@test.com')

    const list = await registry.listPublisherPackages('pub@test.com')
    expect(list.some(p => p.name === 'my-dashboard-pkg')).toBe(true)

    const updated = await registry.updatePublisherPackage('my-dashboard-pkg', 'pub@test.com', {
      description: 'Updated description',
      settings: { npmPublish: true, npmAccess: 'public' },
    })
    expect(updated.description).toBe('Updated description')
    expect(updated.settings?.npmPublish).toBe(true)
    expect(sessionToken.length).toBeGreaterThan(0)
  })
})
