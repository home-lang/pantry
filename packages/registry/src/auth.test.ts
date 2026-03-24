import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import { createServer, type BinaryStorage } from './server'
import { createLocalRegistry } from './registry'
import { InMemoryAnalytics } from './analytics'
import {
  AuthService,
  AuthError,
  InMemoryAuthStorage,
  generateApiToken,
  generateSessionToken,
  hashToken,
  hashPassword,
  verifyPassword,
  isUserApiToken,
} from './auth'

// ===========================================================================
// Unit tests: auth helpers
// ===========================================================================

describe('auth helpers', () => {
  it('generateApiToken returns ptry_ prefixed token', () => {
    const token = generateApiToken()
    expect(token).toStartWith('ptry_')
    expect(token.length).toBeGreaterThan(40)
  })

  it('generateApiToken is unique each call', () => {
    const a = generateApiToken()
    const b = generateApiToken()
    expect(a).not.toBe(b)
  })

  it('generateSessionToken returns hex string', () => {
    const token = generateSessionToken()
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('hashToken returns consistent SHA-256 hash', () => {
    const hash1 = hashToken('test-token')
    const hash2 = hashToken('test-token')
    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/)
  })

  it('hashToken produces different hashes for different tokens', () => {
    const hash1 = hashToken('token-a')
    const hash2 = hashToken('token-b')
    expect(hash1).not.toBe(hash2)
  })

  it('isUserApiToken identifies ptry_ tokens', () => {
    expect(isUserApiToken('ptry_abc123')).toBe(true)
    expect(isUserApiToken('ABCD1234')).toBe(false)
    expect(isUserApiToken('')).toBe(false)
  })

  it('hashPassword and verifyPassword work with argon2id', async () => {
    const hash = await hashPassword('my-secret-password')
    expect(hash).toContain('argon2id')
    expect(await verifyPassword('my-secret-password', hash)).toBe(true)
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })
})

// ===========================================================================
// Unit tests: AuthService
// ===========================================================================

describe('AuthService', () => {
  let storage: InMemoryAuthStorage
  let auth: AuthService

  beforeEach(() => {
    storage = new InMemoryAuthStorage()
    auth = new AuthService(storage)
  })

  describe('signup', () => {
    it('creates a new user account', async () => {
      const user = await auth.signup('user@example.com', 'Test User', 'password123')
      expect(user.email).toBe('user@example.com')
      expect(user.name).toBe('Test User')
      expect(user.createdAt).toBeDefined()
      // Should not include password hash
      expect((user as any).passwordHash).toBeUndefined()
    })

    it('normalizes email to lowercase', async () => {
      const user = await auth.signup('User@EXAMPLE.com', 'Test', 'password123')
      expect(user.email).toBe('user@example.com')
    })

    it('trims name', async () => {
      const user = await auth.signup('user@example.com', '  Test User  ', 'password123')
      expect(user.name).toBe('Test User')
    })

    it('rejects duplicate email', async () => {
      await auth.signup('user@example.com', 'First', 'password123')
      try {
        await auth.signup('user@example.com', 'Second', 'password456')
        expect(true).toBe(false) // Should not reach here
      }
      catch (err: any) {
        expect(err).toBeInstanceOf(AuthError)
        expect(err.status).toBe(409)
        expect(err.message).toContain('already exists')
      }
    })

    it('rejects invalid email', async () => {
      try {
        await auth.signup('not-an-email', 'Test', 'password123')
        expect(true).toBe(false)
      }
      catch (err: any) {
        expect(err).toBeInstanceOf(AuthError)
        expect(err.status).toBe(400)
        expect(err.message).toContain('email')
      }
    })

    it('rejects empty name', async () => {
      try {
        await auth.signup('user@example.com', '', 'password123')
        expect(true).toBe(false)
      }
      catch (err: any) {
        expect(err).toBeInstanceOf(AuthError)
        expect(err.message).toContain('Name')
      }
    })

    it('rejects short password', async () => {
      try {
        await auth.signup('user@example.com', 'Test', 'short')
        expect(true).toBe(false)
      }
      catch (err: any) {
        expect(err).toBeInstanceOf(AuthError)
        expect(err.message).toContain('8 characters')
      }
    })
  })

  describe('login', () => {
    beforeEach(async () => {
      await auth.signup('user@example.com', 'Test User', 'password123')
    })

    it('returns session token and user info on valid credentials', async () => {
      const result = await auth.login('user@example.com', 'password123')
      expect(result.sessionToken).toBeDefined()
      expect(result.sessionToken.length).toBeGreaterThan(0)
      expect(result.user.email).toBe('user@example.com')
      expect(result.user.name).toBe('Test User')
    })

    it('normalizes email for login', async () => {
      const result = await auth.login('User@EXAMPLE.com', 'password123')
      expect(result.user.email).toBe('user@example.com')
    })

    it('rejects wrong password', async () => {
      try {
        await auth.login('user@example.com', 'wrongpassword')
        expect(true).toBe(false)
      }
      catch (err: any) {
        expect(err).toBeInstanceOf(AuthError)
        expect(err.status).toBe(401)
        expect(err.message).toContain('Invalid email or password')
      }
    })

    it('rejects non-existent email', async () => {
      try {
        await auth.login('nobody@example.com', 'password123')
        expect(true).toBe(false)
      }
      catch (err: any) {
        expect(err).toBeInstanceOf(AuthError)
        expect(err.status).toBe(401)
      }
    })
  })

  describe('session management', () => {
    let sessionToken: string

    beforeEach(async () => {
      await auth.signup('user@example.com', 'Test User', 'password123')
      const result = await auth.login('user@example.com', 'password123')
      sessionToken = result.sessionToken
    })

    it('validateSession returns user for valid session', async () => {
      const user = await auth.validateSession(sessionToken)
      expect(user).not.toBeNull()
      expect(user!.email).toBe('user@example.com')
    })

    it('validateSession returns null for invalid token', async () => {
      const user = await auth.validateSession('invalid-token')
      expect(user).toBeNull()
    })

    it('logout destroys session', async () => {
      await auth.logout(sessionToken)
      const user = await auth.validateSession(sessionToken)
      expect(user).toBeNull()
    })
  })

  describe('API tokens', () => {
    beforeEach(async () => {
      await auth.signup('user@example.com', 'Test User', 'password123')
    })

    it('creates an API token with ptry_ prefix', async () => {
      const result = await auth.createApiToken('user@example.com', 'CI Token')
      expect(result.token).toStartWith('ptry_')
      expect(result.info.name).toBe('CI Token')
      expect(result.info.permissions).toContain('publish')
      expect(result.info.permissions).toContain('read')
    })

    it('creates token with custom permissions', async () => {
      const result = await auth.createApiToken('user@example.com', 'Read Only', {
        permissions: ['read'],
      })
      expect(result.info.permissions).toEqual(['read'])
    })

    it('creates token with expiry', async () => {
      const result = await auth.createApiToken('user@example.com', 'Short-lived', {
        expiresInDays: 30,
      })
      expect(result.info.expiresAt).toBeDefined()
    })

    it('rejects empty token name', async () => {
      try {
        await auth.createApiToken('user@example.com', '')
        expect(true).toBe(false)
      }
      catch (err: any) {
        expect(err).toBeInstanceOf(AuthError)
        expect(err.message).toContain('name')
      }
    })

    it('lists tokens for a user', async () => {
      await auth.createApiToken('user@example.com', 'Token A')
      await auth.createApiToken('user@example.com', 'Token B')
      const tokens = await auth.listApiTokens('user@example.com')
      expect(tokens.length).toBe(2)
      expect(tokens.map(t => t.name)).toContain('Token A')
      expect(tokens.map(t => t.name)).toContain('Token B')
    })

    it('deletes a token', async () => {
      const result = await auth.createApiToken('user@example.com', 'To Delete')
      await auth.deleteApiToken('user@example.com', result.info.id)
      const tokens = await auth.listApiTokens('user@example.com')
      expect(tokens.length).toBe(0)
    })

    it('validates API token for publish', async () => {
      const result = await auth.createApiToken('user@example.com', 'Publish Token')
      const validation = await auth.validatePublishToken(result.token, 'LEGACY_TOKEN')
      expect(validation.valid).toBe(true)
      expect(validation.userId).toBe('user@example.com')
    })

    it('rejects invalid API token', async () => {
      const validation = await auth.validatePublishToken('ptry_invalid_token', 'LEGACY_TOKEN')
      expect(validation.valid).toBe(false)
      expect(validation.error).toContain('Invalid')
    })

    it('rejects read-only token for publish', async () => {
      const result = await auth.createApiToken('user@example.com', 'Read Only', {
        permissions: ['read'],
      })
      const validation = await auth.validatePublishToken(result.token, 'LEGACY_TOKEN')
      expect(validation.valid).toBe(false)
      expect(validation.error).toContain('publish permission')
    })

    it('accepts legacy admin token', async () => {
      const validation = await auth.validatePublishToken('LEGACY_TOKEN', 'LEGACY_TOKEN')
      expect(validation.valid).toBe(true)
      expect(validation.userId).toBe('_admin')
    })
  })
})

// ===========================================================================
// E2E: Auth HTTP routes
// ===========================================================================

describe('e2e: auth routes', () => {
  let port: number
  let baseUrl: string
  let server: ReturnType<typeof createServer>
  let authStorage: InMemoryAuthStorage

  beforeEach(() => {
    port = 5000 + Math.floor(Math.random() * 1000)
    baseUrl = `http://localhost:${port}`
    authStorage = new InMemoryAuthStorage()

    const registry = createLocalRegistry(baseUrl)
    const analytics = new InMemoryAnalytics()
    server = createServer(registry, port, analytics, undefined, undefined, undefined, authStorage)
    server.start()
  })

  afterEach(() => {
    server.stop()
  })

  describe('POST /auth/signup', () => {
    it('creates account and returns session cookie', async () => {
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', name: 'Test', password: 'password123' }),
      })
      expect(res.status).toBe(201)
      const body = await res.json() as any
      expect(body.success).toBe(true)
      expect(body.user.email).toBe('user@test.com')

      const cookie = res.headers.get('set-cookie')
      expect(cookie).toContain('pantry_session=')
      expect(cookie).toContain('HttpOnly')
    })

    it('rejects duplicate signup', async () => {
      await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dup@test.com', name: 'Test', password: 'password123' }),
      })

      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dup@test.com', name: 'Test2', password: 'password456' }),
      })
      expect(res.status).toBe(409)
    })

    it('rejects short password', async () => {
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', name: 'Test', password: 'short' }),
      })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', name: 'Test', password: 'password123' }),
      })
    })

    it('authenticates with valid credentials', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', password: 'password123' }),
      })
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.success).toBe(true)
      expect(body.user.email).toBe('user@test.com')
      expect(res.headers.get('set-cookie')).toContain('pantry_session=')
    })

    it('rejects invalid password', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', password: 'wrong' }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /auth/me', () => {
    it('returns user info when authenticated', async () => {
      // Sign up and extract session
      const signupRes = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'me@test.com', name: 'Me', password: 'password123' }),
      })
      const cookie = signupRes.headers.get('set-cookie')!.split(';')[0]

      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Cookie: cookie },
      })
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.user.email).toBe('me@test.com')
    })

    it('rejects unauthenticated request', async () => {
      const res = await fetch(`${baseUrl}/auth/me`)
      expect(res.status).toBe(401)
    })
  })

  describe('POST /auth/logout', () => {
    it('clears session cookie', async () => {
      const signupRes = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'logout@test.com', name: 'Test', password: 'password123' }),
      })
      const cookie = signupRes.headers.get('set-cookie')!.split(';')[0]

      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { Cookie: cookie },
      })
      expect(res.status).toBe(200)
      expect(res.headers.get('set-cookie')).toContain('Max-Age=0')

      // Session should now be invalid
      const meRes = await fetch(`${baseUrl}/auth/me`, { headers: { Cookie: cookie } })
      expect(meRes.status).toBe(401)
    })
  })

  describe('token CRUD', () => {
    let sessionCookie: string

    beforeEach(async () => {
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'tokens@test.com', name: 'TokenUser', password: 'password123' }),
      })
      sessionCookie = res.headers.get('set-cookie')!.split(';')[0]
    })

    it('POST /auth/tokens creates a new token', async () => {
      const res = await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
        body: JSON.stringify({ name: 'CI Token' }),
      })
      expect(res.status).toBe(201)
      const body = await res.json() as any
      expect(body.token).toStartWith('ptry_')
      expect(body.info.name).toBe('CI Token')
    })

    it('GET /auth/tokens lists tokens', async () => {
      await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
        body: JSON.stringify({ name: 'Token A' }),
      })
      await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
        body: JSON.stringify({ name: 'Token B' }),
      })

      const res = await fetch(`${baseUrl}/auth/tokens`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.tokens.length).toBe(2)
    })

    it('DELETE /auth/tokens/:id revokes a token', async () => {
      const createRes = await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
        body: JSON.stringify({ name: 'To Delete' }),
      })
      const { info } = await createRes.json() as any

      const res = await fetch(`${baseUrl}/auth/tokens/${encodeURIComponent(info.id)}`, {
        method: 'DELETE',
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)

      const listRes = await fetch(`${baseUrl}/auth/tokens`, {
        headers: { Cookie: sessionCookie },
      })
      const body = await listRes.json() as any
      expect(body.tokens.length).toBe(0)
    })

    it('token CRUD requires authentication', async () => {
      const res = await fetch(`${baseUrl}/auth/tokens`)
      expect(res.status).toBe(401)

      const createRes = await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Unauthorized' }),
      })
      expect(createRes.status).toBe(401)
    })
  })

  describe('publish with user API token', () => {
    let apiToken: string

    beforeEach(async () => {
      // Create user and token
      const signupRes = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'publisher@test.com', name: 'Publisher', password: 'password123' }),
      })
      const cookie = signupRes.headers.get('set-cookie')!.split(';')[0]

      const tokenRes = await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ name: 'Publish Token' }),
      })
      const body = await tokenRes.json() as any
      apiToken = body.token
    })

    it('publishes with user API token', async () => {
      const metadata = { name: `test-pkg-${Date.now()}`, version: '1.0.0', publishedAt: new Date().toISOString() }
      const tarball = new Uint8Array([0x1f, 0x8b, 0x08, 0x00])

      const formData = new FormData()
      formData.set('metadata', JSON.stringify(metadata))
      formData.set('tarball', new File([tarball], 'test-pkg-1.0.0.tgz'))

      const res = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
        body: formData,
      })
      expect(res.status).toBe(201)
      const body = await res.json() as any
      expect(body.success).toBe(true)
    })

    it('rejects publish with invalid token', async () => {
      const metadata = { name: `test-pkg-${Date.now()}`, version: '1.0.0', publishedAt: new Date().toISOString() }
      const tarball = new Uint8Array([0x1f, 0x8b, 0x08, 0x00])

      const formData = new FormData()
      formData.set('metadata', JSON.stringify(metadata))
      formData.set('tarball', new File([tarball], 'test-pkg-1.0.0.tgz'))

      const res = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ptry_invalid_token_abc123def456' },
        body: formData,
      })
      expect(res.status).toBe(401)
    })

    it('legacy REGISTRY_TOKEN still works for publish', async () => {
      const LEGACY = process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN || 'ABCD1234'
      const metadata = { name: `legacy-pkg-${Date.now()}`, version: '1.0.0', publishedAt: new Date().toISOString() }
      const tarball = new Uint8Array([0x1f, 0x8b, 0x08, 0x00])

      const formData = new FormData()
      formData.set('metadata', JSON.stringify(metadata))
      formData.set('tarball', new File([tarball], 'legacy-pkg-1.0.0.tgz'))

      const res = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${LEGACY}` },
        body: formData,
      })
      expect(res.status).toBe(201)
    })
  })

  describe('site auth pages', () => {
    it('GET /login returns login page', async () => {
      const res = await fetch(`${baseUrl}/login`)
      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('Log in to pantry')
      expect(html).toContain('<form')
      expect(html).toContain('name="email"')
      expect(html).toContain('name="password"')
    })

    it('GET /signup returns signup page', async () => {
      const res = await fetch(`${baseUrl}/signup`)
      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('Create your account')
      expect(html).toContain('name="name"')
      expect(html).toContain('name="email"')
      expect(html).toContain('name="password"')
    })

    it('GET /account redirects to login when unauthenticated', async () => {
      const res = await fetch(`${baseUrl}/account`, { redirect: 'manual' })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/login')
    })

    it('POST /login with valid credentials redirects to account', async () => {
      // Signup first
      await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'form@test.com', name: 'Form', password: 'password123' }),
      })

      const formData = new FormData()
      formData.set('email', 'form@test.com')
      formData.set('password', 'password123')

      const res = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        body: formData,
        redirect: 'manual',
      })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/account')
      expect(res.headers.get('set-cookie')).toContain('pantry_session=')
    })

    it('POST /login with invalid credentials shows error', async () => {
      const formData = new FormData()
      formData.set('email', 'nobody@test.com')
      formData.set('password', 'wrong')

      const res = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBe(401)
      const html = await res.text()
      expect(html).toContain('Invalid email or password')
    })

    it('POST /signup with valid data redirects to account', async () => {
      const formData = new FormData()
      formData.set('name', 'New User')
      formData.set('email', 'new@test.com')
      formData.set('password', 'password123')

      const res = await fetch(`${baseUrl}/signup`, {
        method: 'POST',
        body: formData,
        redirect: 'manual',
      })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/account')
    })

    it('GET /account shows token management when authenticated', async () => {
      // Signup via API
      const signupRes = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'acct@test.com', name: 'Account', password: 'password123' }),
      })
      const cookie = signupRes.headers.get('set-cookie')!.split(';')[0]

      const res = await fetch(`${baseUrl}/account`, {
        headers: { Cookie: cookie },
      })
      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('Account')
      expect(html).toContain('API Tokens')
      expect(html).toContain('Create token')
    })

    it('GET /login redirects to account when already logged in', async () => {
      const signupRes = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'redir@test.com', name: 'Redir', password: 'password123' }),
      })
      const cookie = signupRes.headers.get('set-cookie')!.split(';')[0]

      const res = await fetch(`${baseUrl}/login`, {
        headers: { Cookie: cookie },
        redirect: 'manual',
      })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/account')
    })
  })

  describe('full e2e: signup -> token -> publish', () => {
    it('complete flow from account creation to package publish', async () => {
      // Step 1: Sign up
      const signupRes = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'e2e@test.com', name: 'E2E User', password: 'password123' }),
      })
      expect(signupRes.status).toBe(201)
      const cookie = signupRes.headers.get('set-cookie')!.split(';')[0]

      // Step 2: Create API token
      const tokenRes = await fetch(`${baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ name: 'E2E Publish Token' }),
      })
      expect(tokenRes.status).toBe(201)
      const { token } = await tokenRes.json() as any

      // Step 3: Publish a package
      const e2ePkgName = `e2e-test-pkg-${Date.now()}`
      const metadata = { name: e2ePkgName, version: '1.0.0', description: 'E2E test package', publishedAt: new Date().toISOString() }
      const tarball = new Uint8Array([0x1f, 0x8b, 0x08, 0x00, 0xDE, 0xAD])
      const formData = new FormData()
      formData.set('metadata', JSON.stringify(metadata))
      formData.set('tarball', new File([tarball], 'e2e-test-pkg-1.0.0.tgz'))

      const publishRes = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      expect(publishRes.status).toBe(201)

      // Step 4: Verify package exists
      const pkgRes = await fetch(`${baseUrl}/packages/${e2ePkgName}`)
      expect(pkgRes.status).toBe(200)
      const pkg = await pkgRes.json() as any
      expect(pkg.name).toBe(e2ePkgName)

      // Step 5: List tokens shows lastUsedAt updated
      await new Promise(r => setTimeout(r, 100))
      const listRes = await fetch(`${baseUrl}/auth/tokens`, {
        headers: { Cookie: cookie },
      })
      const listBody = await listRes.json() as any
      expect(listBody.tokens.length).toBe(1)
      expect(listBody.tokens[0].name).toBe('E2E Publish Token')

      // Step 6: Revoke token
      await fetch(`${baseUrl}/auth/tokens/${encodeURIComponent(listBody.tokens[0].id)}`, {
        method: 'DELETE',
        headers: { Cookie: cookie },
      })

      // Step 7: Verify revoked token can't publish
      const formData2 = new FormData()
      formData2.set('metadata', JSON.stringify({ ...metadata, version: '2.0.0' }))
      formData2.set('tarball', new File([tarball], 'e2e-test-pkg-2.0.0.tgz'))
      const failRes = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData2,
      })
      expect(failRes.status).toBe(401)
    })
  })
})
