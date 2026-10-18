import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createServer, type BinaryStorage } from './server'
import { createLocalRegistry } from './registry'
import { AuthService, InMemoryAuthStorage } from './auth'
import { isPublicPath, registryInfo, resolveVisibility, signupsEnabled } from './access'
import { resetPlugins, setPlugins, type RegistryPlugin } from './plugins'
import { getAvailablePort } from './test-utils'
import { S3RequestError } from './storage/aws-client'

const ADMIN_TOKEN = 'ptry_test_admin_token_for_access_tests'

/** Binary storage stub so /binaries/... has something real to gate. */
class MockBinaryStorage implements BinaryStorage {
  private files = new Map<string, Buffer>()

  put(key: string, data: Buffer | string): void {
    this.files.set(key, typeof data === 'string' ? Buffer.from(data) : data)
  }

  async getObject(key: string): Promise<Buffer> {
    const data = this.files.get(key)
    if (!data) throw new S3RequestError('GET', 404, 'NoSuchKey')
    return data
  }
}

describe('registry visibility', () => {
  let port: number
  let baseUrl: string
  let server: ReturnType<typeof createServer>
  let authStorage: InMemoryAuthStorage
  let auth: AuthService
  let binaries: MockBinaryStorage
  const savedEnv: Record<string, string | undefined> = {}

  const ENV_KEYS = [
    'REGISTRY_VISIBILITY',
    'PANTRY_REGISTRY_VISIBILITY',
    'REGISTRY_PRIVATE',
    'REGISTRY_ALLOW_SIGNUP',
    'REGISTRY_SIGNUP_DOMAINS',
    'REGISTRY_PUBLIC_PATHS',
    'REGISTRY_PLUGINS',
    'PANTRY_REGISTRY_TOKEN',
    'PANTRY_TOKEN',
  ]

  async function startServer(): Promise<void> {
    port = await getAvailablePort()
    baseUrl = `http://localhost:${port}`
    authStorage = new InMemoryAuthStorage()
    auth = new AuthService(authStorage)
    binaries = new MockBinaryStorage()
    binaries.put('binaries/curl.se/metadata.json', JSON.stringify({ name: 'curl.se', versions: {} }))
    server = createServer(createLocalRegistry(baseUrl), port, undefined, undefined, binaries, undefined, authStorage)
    server.start()
  }

  beforeEach(async () => {
    for (const key of ENV_KEYS) savedEnv[key] = process.env[key]
    for (const key of ENV_KEYS) delete process.env[key]
    process.env.PANTRY_REGISTRY_TOKEN = ADMIN_TOKEN
    resetPlugins()
    setPlugins([])
    await startServer()
  })

  afterEach(() => {
    server.stop()
    resetPlugins()
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key]
      else process.env[key] = savedEnv[key]
    }
  })

  const asPrivate = (): void => { process.env.REGISTRY_VISIBILITY = 'private' }

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  describe('configuration', () => {
    it('defaults to public so an existing deployment is unaffected', () => {
      expect(resolveVisibility({})).toBe('public')
      expect(signupsEnabled({})).toBe(true)
    })

    it('reads REGISTRY_VISIBILITY, PANTRY_REGISTRY_VISIBILITY and REGISTRY_PRIVATE', () => {
      expect(resolveVisibility({ REGISTRY_VISIBILITY: 'private' })).toBe('private')
      expect(resolveVisibility({ PANTRY_REGISTRY_VISIBILITY: 'PRIVATE' })).toBe('private')
      expect(resolveVisibility({ REGISTRY_PRIVATE: '1' })).toBe('private')
      expect(resolveVisibility({ REGISTRY_VISIBILITY: 'public', REGISTRY_PRIVATE: '1' })).toBe('public')
    })

    it('closes signups by default on a private registry', () => {
      expect(signupsEnabled({ REGISTRY_VISIBILITY: 'private' })).toBe(false)
      expect(signupsEnabled({ REGISTRY_VISIBILITY: 'private', REGISTRY_ALLOW_SIGNUP: 'true' })).toBe(true)
      expect(signupsEnabled({ REGISTRY_ALLOW_SIGNUP: 'false' })).toBe(false)
    })

    it('treats REGISTRY_PUBLIC_PATHS as path prefixes, and bare / as only the root', () => {
      const env = { REGISTRY_PUBLIC_PATHS: '/,/packages/@acme/sdk' }
      expect(isPublicPath('/', env)).toBe(true)
      expect(isPublicPath('/packages/@acme/sdk', env)).toBe(true)
      expect(isPublicPath('/packages/@acme/sdk/1.0.0/tarball', env)).toBe(true)
      expect(isPublicPath('/packages/@acme/sdk-internal', env)).toBe(false)
      expect(isPublicPath('/packages/other', env)).toBe(false)
    })

    it('always keeps health, login and discovery public', () => {
      for (const path of ['/health', '/ready', '/api/registry-info', '/login', '/auth/login'])
        expect(isPublicPath(path, {})).toBe(true)
    })

    it('describes itself for clients', () => {
      const info = registryInfo({ REGISTRY_VISIBILITY: 'private' }, 'https://registry.example.com')
      expect(info.visibility).toBe('private')
      expect(info.requiresAuth).toBe(true)
      expect(info.signupsEnabled).toBe(false)
      expect(info.loginUrl).toBe('https://registry.example.com/login')
    })
  })

  // -------------------------------------------------------------------------
  // Public mode is unchanged
  // -------------------------------------------------------------------------

  describe('public registry', () => {
    it('serves reads without a credential', async () => {
      const search = await fetch(`${baseUrl}/search?q=curl&format=json`)
      expect(search.status).toBe(200)

      const binary = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)
      expect(binary.status).toBe(200)
    })

    it('reports itself as public', async () => {
      const res = await fetch(`${baseUrl}/api/registry-info`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.visibility).toBe('public')
      expect(body.requiresAuth).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Private mode
  // -------------------------------------------------------------------------

  describe('private registry', () => {
    it('rejects anonymous reads with 401 and a usable hint', async () => {
      asPrivate()
      const res = await fetch(`${baseUrl}/packages/left-pad`)
      expect(res.status).toBe(401)
      expect(res.headers.get('www-authenticate')).toContain('Bearer')
      const body = await res.json() as any
      expect(body.hint).toContain('pantry token set --registry')
    })

    it('gates downloads, binaries and search too', async () => {
      asPrivate()
      for (const path of ['/binaries/curl.se/metadata.json', '/search?q=curl&format=json', '/packages/left-pad/1.0.0/tarball']) {
        const res = await fetch(`${baseUrl}${path}`)
        expect(res.status).toBe(401)
      }
    })

    it('keeps health and discovery reachable', async () => {
      asPrivate()
      expect((await fetch(`${baseUrl}/health`)).status).toBe(200)

      const info = await fetch(`${baseUrl}/api/registry-info`)
      expect(info.status).toBe(200)
      expect((await info.json() as any).requiresAuth).toBe(true)
    })

    it('accepts the shared registry token', async () => {
      asPrivate()
      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      })
      expect(res.status).toBe(200)
    })

    it('accepts a read-only user token', async () => {
      asPrivate()
      await auth.signup('reader@acme.com', 'Reader', 'password123')
      const { token } = await auth.createApiToken('reader@acme.com', 'ci', { permissions: ['read'] })

      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(200)
    })

    it('accepts a publish token for reads (publish implies read)', async () => {
      asPrivate()
      await auth.signup('publisher@acme.com', 'Publisher', 'password123')
      const { token } = await auth.createApiToken('publisher@acme.com', 'ci', { permissions: ['publish'] })

      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(200)
    })

    it('rejects an unknown token', async () => {
      asPrivate()
      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Authorization: 'Bearer ptry_not_a_real_token' },
      })
      expect(res.status).toBe(401)
    })

    it('rejects an expired token', async () => {
      asPrivate()
      await auth.signup('expired@acme.com', 'Expired', 'password123')
      const { token } = await auth.createApiToken('expired@acme.com', 'old', { permissions: ['read'], expiresInDays: -1 })

      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status).toBe(401)
    })

    it('accepts a logged-in session cookie', async () => {
      asPrivate()
      await auth.signup('member@acme.com', 'Member', 'password123')
      const { sessionToken } = await auth.login('member@acme.com', 'password123')

      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Cookie: `pantry_session=${sessionToken}` },
      })
      expect(res.status).toBe(200)
    })

    it('sends browsers to the login page instead of a JSON 401', async () => {
      asPrivate()
      const res = await fetch(`${baseUrl}/packages/left-pad`, {
        headers: { Accept: 'text/html' },
        redirect: 'manual',
      })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/login?next=%2Fpackages%2Fleft-pad')
    })

    it('honours REGISTRY_PUBLIC_PATHS holes', async () => {
      asPrivate()
      process.env.REGISTRY_PUBLIC_PATHS = '/binaries/curl.se'
      expect((await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)).status).toBe(200)
      expect((await fetch(`${baseUrl}/packages/left-pad`)).status).toBe(401)
    })
  })

  // -------------------------------------------------------------------------
  // Signups
  // -------------------------------------------------------------------------

  describe('signups', () => {
    it('are refused on a private registry', async () => {
      asPrivate()
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'outsider@example.com', name: 'Outsider', password: 'password123' }),
      })
      expect(res.status).toBe(403)
    })

    it('can be re-opened and restricted to company domains', async () => {
      asPrivate()
      process.env.REGISTRY_ALLOW_SIGNUP = 'true'
      process.env.REGISTRY_SIGNUP_DOMAINS = 'acme.com'

      const outsider = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'outsider@example.com', name: 'Outsider', password: 'password123' }),
      })
      expect(outsider.status).toBe(403)

      const colleague = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dev@acme.com', name: 'Dev', password: 'password123' }),
      })
      expect(colleague.status).toBe(201)
    })
  })

  // -------------------------------------------------------------------------
  // Member + token administration
  // -------------------------------------------------------------------------

  describe('admin endpoints', () => {
    const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_TOKEN}` }

    it('refuse callers without the registry token', async () => {
      const res = await fetch(`${baseUrl}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dev@acme.com', name: 'Dev', password: 'password123' }),
      })
      expect(res.status).toBe(401)
    })

    it('refuse a plain publish token (it must not be able to mint access)', async () => {
      await auth.signup('publisher@acme.com', 'Publisher', 'password123')
      const { token } = await auth.createApiToken('publisher@acme.com', 'ci', { permissions: ['publish'] })

      const res = await fetch(`${baseUrl}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: 'dev@acme.com', name: 'Dev', password: 'password123' }),
      })
      expect(res.status).toBe(401)
    })

    it('create a member and mint a read-only token that can download', async () => {
      asPrivate()

      const created = await fetch(`${baseUrl}/admin/users`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ email: 'dev@acme.com', name: 'Dev', password: 'password123' }),
      })
      expect(created.status).toBe(201)
      expect((await created.json() as any).user.role).toBe('user')

      const minted = await fetch(`${baseUrl}/admin/tokens`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ email: 'dev@acme.com', name: 'laptop', permissions: ['read'] }),
      })
      expect(minted.status).toBe(201)
      const { token, info } = await minted.json() as any
      expect(info.permissions).toEqual(['read'])

      const download = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(download.status).toBe(200)

      // ...and revoking it closes the door again.
      const revoked = await fetch(`${baseUrl}/admin/tokens/revoke`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ email: 'dev@acme.com', id: info.id }),
      })
      expect(revoked.status).toBe(200)

      const afterRevoke = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(afterRevoke.status).toBe(401)
    })

    it('will not mint a token for an unknown user', async () => {
      const res = await fetch(`${baseUrl}/admin/tokens`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ email: 'ghost@acme.com', name: 'ghost' }),
      })
      expect(res.status).toBe(404)
    })
  })

  // -------------------------------------------------------------------------
  // Plugins
  // -------------------------------------------------------------------------

  describe('plugins', () => {
    it('can open a path on a private registry', async () => {
      asPrivate()
      setPlugins([{
        name: 'open-sdk',
        authorizeRead: ctx => ctx.path.startsWith('/binaries/curl.se') ? 'allow' : undefined,
      }])

      expect((await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)).status).toBe(200)
      expect((await fetch(`${baseUrl}/packages/left-pad`)).status).toBe(401)
    })

    it('can deny a request that holds a valid token', async () => {
      setPlugins([{ name: 'ip-allowlist', authorizeRead: () => 'deny' }])

      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      })
      expect(res.status).toBe(403)
    })

    it('denies rather than fails open when a policy throws', async () => {
      setPlugins([{ name: 'broken', authorizeRead: () => { throw new Error('boom') } }])
      expect((await fetch(`${baseUrl}/health`)).status).toBe(403)
    })

    it('can serve its own routes and see the resolved identity', async () => {
      asPrivate()
      const seen: (string | null)[] = []
      const plugin: RegistryPlugin = {
        name: 'teams',
        authorizeRead: (ctx) => { seen.push(ctx.userId); return undefined },
        handleRequest: (_req, ctx) => ctx.path === '/api/teams' ? Response.json({ teams: ['core'] }) : null,
      }
      setPlugins([plugin])

      const res = await fetch(`${baseUrl}/api/teams`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } })
      expect(res.status).toBe(200)
      expect((await res.json() as any).teams).toEqual(['core'])
      expect(seen).toContain('_admin')
    })

    it('receives access events', async () => {
      asPrivate()
      const events: string[] = []
      setPlugins([{ name: 'audit', onEvent: e => { events.push(e.type) } }])

      await fetch(`${baseUrl}/packages/left-pad`)
      await fetch(`${baseUrl}/packages/left-pad`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } })
      await Bun.sleep(50)

      expect(events).toContain('access-denied')
      expect(events).toContain('access-granted')
    })
  })
})
