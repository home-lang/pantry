/**
 * Authentication module for the pantry registry.
 *
 * Provides:
 * - User signup / login with Argon2id password hashing (via Bun.password)
 * - API token generation with `ptry_` prefix for programmatic access
 * - Session management for web UI authentication
 * - In-memory and DynamoDB storage backends
 *
 * Security design:
 * - Passwords are hashed with Argon2id (Bun.password.hash)
 * - API tokens are stored as SHA-256 hashes (raw token shown only once at creation)
 * - Session tokens are stored as SHA-256 hashes
 * - All tokens use crypto.randomUUID for generation
 */

import * as crypto from 'node:crypto'
import type {
  ApiToken,
  ApiTokenInfo,
  AuthStorage,
  Session,
  TokenValidationResult,
  User,
} from './types'
import { DynamoDBClient } from './storage/dynamodb-client'

// ===========================================================================
// Token / Hash Helpers
// ===========================================================================

/** Prefix for API tokens — makes them easily identifiable */
const TOKEN_PREFIX = 'ptry_'

/** Generate a cryptographically random API token with the ptry_ prefix */
export function generateApiToken(): string {
  const raw = crypto.randomBytes(32).toString('hex')
  return `${TOKEN_PREFIX}${raw}`
}

/** Generate a cryptographically random session token */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/** Compute SHA-256 hex digest of a string */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/** Check whether a token string looks like a user API token */
export function isUserApiToken(token: string): boolean {
  return token.startsWith(TOKEN_PREFIX)
}

// ===========================================================================
// Password Helpers (Bun.password — Argon2id)
// ===========================================================================

/** Hash a plaintext password using Argon2id */
export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: 'argon2id' })
}

/** Verify a plaintext password against a stored hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return Bun.password.verify(password, hash)
}

// ===========================================================================
// Auth Service — orchestrates auth operations
// ===========================================================================

export class AuthService {
  constructor(private storage: AuthStorage) {}

  /**
   * Register a new user account.
   * Returns the created user (without password hash).
   * Throws if email is already registered.
   */
  async signup(email: string, name: string, password: string): Promise<Omit<User, 'passwordHash'>> {
    const normalizedEmail = email.toLowerCase().trim()

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new AuthError('Invalid email address', 400)
    }
    if (!name || name.trim().length === 0) {
      throw new AuthError('Name is required', 400)
    }
    if (!password || password.length < 8) {
      throw new AuthError('Password must be at least 8 characters', 400)
    }

    const existing = await this.storage.getUser(normalizedEmail)
    if (existing) {
      throw new AuthError('An account with this email already exists', 409)
    }

    const now = new Date().toISOString()
    const passwordHash = await hashPassword(password)

    const user: User = {
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      createdAt: now,
      updatedAt: now,
    }

    await this.storage.putUser(user)

    return { email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt }
  }

  /**
   * Authenticate a user and create a web session.
   * Returns the raw session token (to be set as an HTTP-only cookie).
   */
  async login(email: string, password: string): Promise<{ sessionToken: string, user: Omit<User, 'passwordHash'> }> {
    const normalizedEmail = email.toLowerCase().trim()

    const user = await this.storage.getUser(normalizedEmail)
    if (!user) {
      throw new AuthError('Invalid email or password', 401)
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      throw new AuthError('Invalid email or password', 401)
    }

    // Create session (30-day expiry)
    const sessionToken = generateSessionToken()
    const session: Session = {
      tokenHash: hashToken(sessionToken),
      userId: user.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
    await this.storage.putSession(session)

    return {
      sessionToken,
      user: { email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt },
    }
  }

  /** Destroy a web session (logout). */
  async logout(sessionToken: string): Promise<void> {
    await this.storage.deleteSession(hashToken(sessionToken))
  }

  /** Validate a session token and return the associated user. */
  async validateSession(sessionToken: string): Promise<Omit<User, 'passwordHash'> | null> {
    const session = await this.storage.getSession(hashToken(sessionToken))
    if (!session) return null

    // Check expiry
    if (new Date(session.expiresAt) < new Date()) {
      await this.storage.deleteSession(session.tokenHash)
      return null
    }

    const user = await this.storage.getUser(session.userId)
    if (!user) return null

    return { email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt }
  }

  /**
   * Create a new API token for a user.
   * Returns the full token info INCLUDING the raw token string (shown only once).
   */
  async createApiToken(
    userId: string,
    name: string,
    options?: { permissions?: ('publish' | 'read')[], expiresInDays?: number },
  ): Promise<{ token: string, info: ApiTokenInfo }> {
    if (!name || name.trim().length === 0) {
      throw new AuthError('Token name is required', 400)
    }

    const rawToken = generateApiToken()
    const now = new Date().toISOString()
    const expiresAt = options?.expiresInDays
      ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined

    const apiToken: ApiToken = {
      id: `${rawToken.slice(0, 8)}...${rawToken.slice(-4)}`,
      name: name.trim(),
      userId,
      tokenHash: hashToken(rawToken),
      permissions: options?.permissions || ['publish', 'read'],
      createdAt: now,
      expiresAt,
    }

    await this.storage.putApiToken(apiToken)

    return {
      token: rawToken,
      info: {
        id: apiToken.id,
        name: apiToken.name,
        permissions: apiToken.permissions,
        createdAt: apiToken.createdAt,
        expiresAt: apiToken.expiresAt,
      },
    }
  }

  /** List all API tokens for a user (without hashes). */
  async listApiTokens(userId: string): Promise<ApiTokenInfo[]> {
    const tokens = await this.storage.listApiTokens(userId)
    return tokens.map(t => ({
      id: t.id,
      name: t.name,
      permissions: t.permissions,
      createdAt: t.createdAt,
      lastUsedAt: t.lastUsedAt,
      expiresAt: t.expiresAt,
    }))
  }

  /** Delete an API token by its display ID. */
  async deleteApiToken(userId: string, tokenId: string): Promise<void> {
    await this.storage.deleteApiToken(userId, tokenId)
  }

  /**
   * Validate a Bearer token for publish operations.
   * Handles both legacy REGISTRY_TOKEN and user ptry_ tokens.
   */
  async validatePublishToken(token: string, legacyToken: string): Promise<TokenValidationResult> {
    // Legacy admin token check (constant-time comparison to prevent timing attacks)
    if (legacyToken && token.length === legacyToken.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(legacyToken))) {
      return { valid: true, userId: '_admin' }
    }

    // User API token
    if (isUserApiToken(token)) {
      const tokenRecord = await this.storage.getApiTokenByHash(hashToken(token))
      if (!tokenRecord) {
        return { valid: false, error: 'Invalid token' }
      }

      // Check expiry
      if (tokenRecord.expiresAt && new Date(tokenRecord.expiresAt) < new Date()) {
        return { valid: false, error: 'Token has expired' }
      }

      // Check publish permission
      if (!tokenRecord.permissions.includes('publish')) {
        return { valid: false, error: 'Token does not have publish permission' }
      }

      // Update last-used timestamp (fire-and-forget)
      this.storage.updateTokenLastUsed(tokenRecord.tokenHash).catch(err => console.warn('Failed to update token last-used:', err))

      return { valid: true, userId: tokenRecord.userId, tokenId: tokenRecord.id }
    }

    // Not a recognized token format
    return { valid: false, error: 'Invalid token' }
  }
}

// ===========================================================================
// Auth Error
// ===========================================================================

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

// ===========================================================================
// In-Memory Auth Storage (development / testing)
// ===========================================================================

export class InMemoryAuthStorage implements AuthStorage {
  private users = new Map<string, User>()
  private apiTokensByHash = new Map<string, ApiToken>()
  private apiTokensByUser = new Map<string, ApiToken[]>()
  private sessions = new Map<string, Session>()

  async getUser(email: string): Promise<User | null> {
    return this.users.get(email.toLowerCase()) || null
  }

  async putUser(user: User): Promise<void> {
    this.users.set(user.email.toLowerCase(), user)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.getUser(email)
  }

  async putApiToken(token: ApiToken): Promise<void> {
    this.apiTokensByHash.set(token.tokenHash, token)
    const userTokens = this.apiTokensByUser.get(token.userId) || []
    userTokens.push(token)
    this.apiTokensByUser.set(token.userId, userTokens)
  }

  async getApiTokenByHash(tokenHash: string): Promise<ApiToken | null> {
    return this.apiTokensByHash.get(tokenHash) || null
  }

  async listApiTokens(userId: string): Promise<ApiToken[]> {
    return this.apiTokensByUser.get(userId) || []
  }

  async deleteApiToken(userId: string, tokenId: string): Promise<void> {
    const tokens = this.apiTokensByUser.get(userId) || []
    const tokenToDelete = tokens.find(t => t.id === tokenId)
    if (tokenToDelete) {
      this.apiTokensByHash.delete(tokenToDelete.tokenHash)
      this.apiTokensByUser.set(userId, tokens.filter(t => t.id !== tokenId))
    }
  }

  async updateTokenLastUsed(tokenHash: string): Promise<void> {
    const token = this.apiTokensByHash.get(tokenHash)
    if (token) {
      token.lastUsedAt = new Date().toISOString()
    }
  }

  async putSession(session: Session): Promise<void> {
    this.sessions.set(session.tokenHash, session)
  }

  async getSession(tokenHash: string): Promise<Session | null> {
    return this.sessions.get(tokenHash) || null
  }

  async deleteSession(tokenHash: string): Promise<void> {
    this.sessions.delete(tokenHash)
  }
}

// ===========================================================================
// DynamoDB Auth Storage (production)
//
// Single-table design keys:
//   USER#{email}          / PROFILE           — user account
//   USER#{email}          / API_TOKEN#{id}    — API token metadata
//   TOKEN_HASH#{hash}     / METADATA          — reverse lookup for token validation
//   SESSION#{hash}        / METADATA          — web session
// ===========================================================================

export class DynamoDBAuthStorage implements AuthStorage {
  private db: DynamoDBClient
  private tableName: string

  constructor(tableName: string, region = 'us-east-1') {
    this.tableName = tableName
    this.db = new DynamoDBClient(region)
  }

  async getUser(email: string): Promise<User | null> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `USER#${email.toLowerCase()}` },
        SK: { S: 'PROFILE' },
      },
    })

    if (!result.Item) return null
    const data = DynamoDBClient.unmarshal(result.Item)
    return {
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  }

  async putUser(user: User): Promise<void> {
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `USER#${user.email.toLowerCase()}`,
        SK: 'PROFILE',
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.getUser(email)
  }

  async putApiToken(token: ApiToken): Promise<void> {
    // Store under user key for listing
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `USER#${token.userId}`,
        SK: `API_TOKEN#${token.id}`,
        id: token.id,
        name: token.name,
        userId: token.userId,
        tokenHash: token.tokenHash,
        permissions: token.permissions,
        createdAt: token.createdAt,
        lastUsedAt: token.lastUsedAt || '',
        expiresAt: token.expiresAt || '',
      }),
    })

    // Store reverse lookup by hash for fast validation
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `TOKEN_HASH#${token.tokenHash}`,
        SK: 'METADATA',
        id: token.id,
        name: token.name,
        userId: token.userId,
        tokenHash: token.tokenHash,
        permissions: token.permissions,
        createdAt: token.createdAt,
        lastUsedAt: token.lastUsedAt || '',
        expiresAt: token.expiresAt || '',
      }),
    })
  }

  async getApiTokenByHash(tokenHash: string): Promise<ApiToken | null> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `TOKEN_HASH#${tokenHash}` },
        SK: { S: 'METADATA' },
      },
    })

    if (!result.Item) return null
    const data = DynamoDBClient.unmarshal(result.Item)
    return {
      id: data.id,
      name: data.name,
      userId: data.userId,
      tokenHash: data.tokenHash,
      permissions: data.permissions || ['publish', 'read'],
      createdAt: data.createdAt,
      lastUsedAt: data.lastUsedAt || undefined,
      expiresAt: data.expiresAt || undefined,
    }
  }

  async listApiTokens(userId: string): Promise<ApiToken[]> {
    const result = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `USER#${userId}` },
        ':prefix': { S: 'API_TOKEN#' },
      },
    })

    return result.Items.map((item) => {
      const data = DynamoDBClient.unmarshal(item)
      return {
        id: data.id,
        name: data.name,
        userId: data.userId,
        tokenHash: data.tokenHash,
        permissions: data.permissions || ['publish', 'read'],
        createdAt: data.createdAt,
        lastUsedAt: data.lastUsedAt || undefined,
        expiresAt: data.expiresAt || undefined,
      }
    })
  }

  async deleteApiToken(userId: string, tokenId: string): Promise<void> {
    // Get the token first to find its hash (needed for reverse lookup cleanup)
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `USER#${userId}` },
        SK: { S: `API_TOKEN#${tokenId}` },
      },
    })

    if (result.Item) {
      const data = DynamoDBClient.unmarshal(result.Item)

      // Delete user record
      await this.db.deleteItem({
        TableName: this.tableName,
        Key: {
          PK: { S: `USER#${userId}` },
          SK: { S: `API_TOKEN#${tokenId}` },
        },
      })

      // Delete reverse lookup
      if (data.tokenHash) {
        await this.db.deleteItem({
          TableName: this.tableName,
          Key: {
            PK: { S: `TOKEN_HASH#${data.tokenHash}` },
            SK: { S: 'METADATA' },
          },
        })
      }
    }
  }

  async updateTokenLastUsed(tokenHash: string): Promise<void> {
    const now = new Date().toISOString()

    // Update reverse lookup record
    await this.db.updateItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `TOKEN_HASH#${tokenHash}` },
        SK: { S: 'METADATA' },
      },
      UpdateExpression: 'SET lastUsedAt = :now',
      ExpressionAttributeValues: {
        ':now': { S: now },
      },
    })
  }

  async putSession(session: Session): Promise<void> {
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `SESSION#${session.tokenHash}`,
        SK: 'METADATA',
        tokenHash: session.tokenHash,
        userId: session.userId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      }),
    })
  }

  async getSession(tokenHash: string): Promise<Session | null> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `SESSION#${tokenHash}` },
        SK: { S: 'METADATA' },
      },
    })

    if (!result.Item) return null
    const data = DynamoDBClient.unmarshal(result.Item)

    // Check expiry
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      // Expired — clean up
      await this.deleteSession(tokenHash)
      return null
    }

    return {
      tokenHash: data.tokenHash,
      userId: data.userId,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
    }
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.db.deleteItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `SESSION#${tokenHash}` },
        SK: { S: 'METADATA' },
      },
    })
  }
}

// ===========================================================================
// Factory
// ===========================================================================

/**
 * Create an AuthStorage instance based on the environment.
 * Uses the same DynamoDB table as MetadataStorage in production.
 */
export function createAuthStorage(tableName?: string, region?: string): AuthStorage {
  const table = tableName || process.env.DYNAMODB_TABLE || 'local'
  if (table && table !== 'local') {
    return new DynamoDBAuthStorage(table, region || process.env.AWS_REGION || 'us-east-1')
  }
  return new InMemoryAuthStorage()
}
