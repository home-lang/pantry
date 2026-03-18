import { describe, expect, it } from 'bun:test'
import { InMemoryMetadataStorage } from './storage/metadata'
import { checkPaywallAccess, configurePaywall, formatPrice } from './paywall'
import type { PackagePaywall, PackageAccessGrant } from './types'

describe('Paywall', () => {
  describe('checkPaywallAccess', () => {
    it('allows access when no paywall exists', async () => {
      const storage = new InMemoryMetadataStorage()
      const result = await checkPaywallAccess(storage, 'my-package', '1.0.0', null)
      expect(result.allowed).toBe(true)
    })

    it('allows access when paywall is disabled', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall: PackagePaywall = {
        name: 'my-package',
        enabled: false,
        price: 999,
        currency: 'usd',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await storage.putPaywall(paywall)
      const result = await checkPaywallAccess(storage, 'my-package', '1.0.0', null)
      expect(result.allowed).toBe(true)
    })

    it('blocks access when paywall is active and no token', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall: PackagePaywall = {
        name: 'my-package',
        enabled: true,
        price: 999,
        currency: 'usd',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await storage.putPaywall(paywall)
      const result = await checkPaywallAccess(storage, 'my-package', '1.0.0', null)
      expect(result.allowed).toBe(false)
      expect(result.paywall).toBeDefined()
      expect(result.reason).toBe('Authentication required for paid package')
    })

    it('blocks access when token has no grant', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall: PackagePaywall = {
        name: 'my-package',
        enabled: true,
        price: 999,
        currency: 'usd',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await storage.putPaywall(paywall)
      const result = await checkPaywallAccess(storage, 'my-package', '1.0.0', 'invalid-token')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Payment required')
    })

    it('allows access when token has valid grant', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall: PackagePaywall = {
        name: 'my-package',
        enabled: true,
        price: 999,
        currency: 'usd',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await storage.putPaywall(paywall)

      const grant: PackageAccessGrant = {
        packageName: 'my-package',
        token: 'valid-token',
        grantedAt: new Date().toISOString(),
      }
      await storage.putAccessGrant(grant)

      const result = await checkPaywallAccess(storage, 'my-package', '1.0.0', 'valid-token')
      expect(result.allowed).toBe(true)
    })

    it('allows access to free versions even without token', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall: PackagePaywall = {
        name: 'my-package',
        enabled: true,
        price: 999,
        currency: 'usd',
        freeVersions: ['1.0.0', '0.9.0'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await storage.putPaywall(paywall)

      const freeResult = await checkPaywallAccess(storage, 'my-package', '1.0.0', null)
      expect(freeResult.allowed).toBe(true)

      const paidResult = await checkPaywallAccess(storage, 'my-package', '2.0.0', null)
      expect(paidResult.allowed).toBe(false)
    })

    it('blocks access when grant has expired', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall: PackagePaywall = {
        name: 'my-package',
        enabled: true,
        price: 999,
        currency: 'usd',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await storage.putPaywall(paywall)

      const grant: PackageAccessGrant = {
        packageName: 'my-package',
        token: 'expired-token',
        grantedAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() - 3600000).toISOString(), // expired 1 hour ago
      }
      await storage.putAccessGrant(grant)

      const result = await checkPaywallAccess(storage, 'my-package', '1.0.0', 'expired-token')
      expect(result.allowed).toBe(false)
    })
  })

  describe('configurePaywall', () => {
    it('creates a new paywall', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall = await configurePaywall(storage, 'my-package', { price: 999 })
      expect(paywall.name).toBe('my-package')
      expect(paywall.enabled).toBe(true)
      expect(paywall.price).toBe(999)
      expect(paywall.currency).toBe('usd')

      // Verify it's stored
      const stored = await storage.getPaywall('my-package')
      expect(stored).toBeDefined()
      expect(stored!.price).toBe(999)
    })

    it('updates existing paywall', async () => {
      const storage = new InMemoryMetadataStorage()
      await configurePaywall(storage, 'my-package', { price: 999 })
      const updated = await configurePaywall(storage, 'my-package', { price: 1999, currency: 'eur' })
      expect(updated.price).toBe(1999)
      expect(updated.currency).toBe('eur')
    })

    it('preserves free versions', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall = await configurePaywall(storage, 'my-package', {
        price: 999,
        freeVersions: ['1.0.0'],
      })
      expect(paywall.freeVersions).toEqual(['1.0.0'])
    })
  })

  describe('deletePaywall', () => {
    it('disables the paywall', async () => {
      const storage = new InMemoryMetadataStorage()
      await configurePaywall(storage, 'my-package', { price: 999 })

      // Verify it's active
      let paywall = await storage.getPaywall('my-package')
      expect(paywall).toBeDefined()

      // Delete (disable)
      await storage.deletePaywall('my-package')

      // getPaywall returns null for disabled paywalls
      paywall = await storage.getPaywall('my-package')
      expect(paywall).toBeNull()

      // But access should now be allowed
      const result = await checkPaywallAccess(storage, 'my-package', '1.0.0', null)
      expect(result.allowed).toBe(true)
    })
  })

  describe('formatPrice', () => {
    it('formats USD prices', () => {
      expect(formatPrice(999, 'usd')).toBe('$9.99')
      expect(formatPrice(100, 'usd')).toBe('$1.00')
      expect(formatPrice(4999, 'usd')).toBe('$49.99')
    })

    it('formats EUR prices', () => {
      expect(formatPrice(999, 'eur')).toBe('€9.99')
    })

    it('formats GBP prices', () => {
      expect(formatPrice(999, 'gbp')).toBe('£9.99')
    })

    it('formats other currencies with code', () => {
      expect(formatPrice(999, 'jpy')).toBe('JPY 9.99')
    })
  })

  describe('DynamoDB storage', () => {
    it('round-trips paywall through in-memory storage', async () => {
      const storage = new InMemoryMetadataStorage()
      const paywall: PackagePaywall = {
        name: 'test-pkg',
        enabled: true,
        price: 2500,
        currency: 'usd',
        freeVersions: ['0.1.0'],
        trialDays: 7,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      await storage.putPaywall(paywall)
      const retrieved = await storage.getPaywall('test-pkg')
      expect(retrieved).toBeDefined()
      expect(retrieved!.price).toBe(2500)
      expect(retrieved!.freeVersions).toEqual(['0.1.0'])
      expect(retrieved!.trialDays).toBe(7)
    })

    it('round-trips access grant through in-memory storage', async () => {
      const storage = new InMemoryMetadataStorage()
      const grant: PackageAccessGrant = {
        packageName: 'test-pkg',
        token: 'tok_123',
        stripePaymentId: 'pi_abc',
        grantedAt: '2024-01-01T00:00:00Z',
      }
      await storage.putAccessGrant(grant)
      const retrieved = await storage.getAccessGrant('test-pkg', 'tok_123')
      expect(retrieved).toBeDefined()
      expect(retrieved!.stripePaymentId).toBe('pi_abc')
    })

    it('returns null for non-existent grant', async () => {
      const storage = new InMemoryMetadataStorage()
      const result = await storage.getAccessGrant('no-pkg', 'no-token')
      expect(result).toBeNull()
    })
  })
})
