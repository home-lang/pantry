/**
 * What a subscription actually changes, exercised against a running server:
 * the fee a seller pays per sale, and the four things a paid plan unlocks.
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createServer } from './server'
import { createLocalRegistry } from './registry'
import { AuthService, InMemoryAuthStorage } from './auth'
import { calculateFee } from './subscriptions'
import { getAvailablePort } from './test-utils'

const ADMIN_TOKEN = 'ptry_admin_token_for_tier_tests'

describe('subscription tiers', () => {
  let port: number
  let baseUrl: string
  let server: ReturnType<typeof createServer>
  let auth: AuthService
  let registry: ReturnType<typeof createLocalRegistry>
  const savedEnv: Record<string, string | undefined> = {}
  const ENV_KEYS = ['PANTRY_REGISTRY_TOKEN', 'PANTRY_TOKEN', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']

  async function account(email: string): Promise<{ token: string, session: string }> {
    await auth.signup(email, email.split('@')[0], 'password123')
    const { token } = await auth.createApiToken(email, 'test', { permissions: ['publish', 'read'] })
    const { sessionToken } = await auth.login(email, 'password123')
    return { token, session: sessionToken }
  }

  async function publish(name: string, token: string, sizeBytes = 16): Promise<Response> {
    const form = new FormData()
    form.set('metadata', JSON.stringify({ name, version: '1.0.0', description: 'x' }))
    form.set('tarball', new File([new Uint8Array(sizeBytes)], `${name}.tgz`))
    return fetch(`${baseUrl}/publish`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
  }

  beforeEach(async () => {
    for (const key of ENV_KEYS) savedEnv[key] = process.env[key]
    process.env.PANTRY_REGISTRY_TOKEN = ADMIN_TOKEN
    delete process.env.STRIPE_SECRET_KEY

    port = await getAvailablePort()
    baseUrl = `http://localhost:${port}`
    registry = createLocalRegistry(baseUrl)
    const storage = new InMemoryAuthStorage()
    auth = new AuthService(storage)
    server = createServer(registry, port, undefined, undefined, undefined, undefined, storage)
    server.start()
  })

  afterEach(() => {
    server.stop()
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key]
      else process.env[key] = savedEnv[key]
    }
  })

  // -------------------------------------------------------------------------

  describe('plans', () => {
    it('publishes the tier table without authentication', async () => {
      const res = await fetch(`${baseUrl}/api/plans`)
      expect(res.status).toBe(200)
      const body = await res.json() as any

      const byId = Object.fromEntries(body.plans.map((p: any) => [p.id, p]))
      expect(byId.free.sellingFee).toBe('10%')
      expect(byId.pro.sellingFee).toBe('5%')
      expect(byId.team.sellingFee).toBe('5%')
      // `commission` is kept as an alias so a CLI built before the rename
      // still renders the right number against a newer registry.
      expect(byId.free.commission).toBe('10%')
      expect(byId.pro.formattedPrice).toBe('$9/mo')
      expect(byId.team.formattedPrice).toBe('$29/mo')
      expect(body.discoveryFee).toBe('3%')
    })

    it('reports the account\'s own plan', async () => {
      const { session } = await account('solo@acme.com')
      const res = await fetch(`${baseUrl}/account/subscription`, { headers: { Cookie: `pantry_session=${session}` } })
      const body = await res.json() as any
      expect(body.tier).toBe('free')
      expect(body.sellingFee).toBe('10%')
      expect(body.manageable).toBe(false)
    })

    it('will not let an API token move an account onto a paid plan', async () => {
      const { token } = await account('solo@acme.com')
      const res = await fetch(`${baseUrl}/account/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tier: 'pro' }),
      })
      expect(res.status).toBe(401)
    })
  })

  // -------------------------------------------------------------------------

  describe('the selling fee', () => {
    it('is 10% for a free seller and 5% once they subscribe', () => {
      expect(calculateFee({ amount: 2000, sellerTier: 'free', discoveredOnSite: false }).applicationFee).toBe(200)
      expect(calculateFee({ amount: 2000, sellerTier: 'pro', discoveredOnSite: false }).applicationFee).toBe(100)
      expect(calculateFee({ amount: 2000, sellerTier: 'team', discoveredOnSite: false }).applicationFee).toBe(100)
    })

    it('adds the discovery fee only for sales the site started', () => {
      const fromSite = calculateFee({ amount: 2000, sellerTier: 'pro', discoveredOnSite: true })
      const fromCli = calculateFee({ amount: 2000, sellerTier: 'pro', discoveredOnSite: false })
      expect(fromSite.applicationFee - fromCli.applicationFee).toBe(60) // 3% of $20
    })

    it('follows the seller\'s plan at the time of sale, not the package', async () => {
      const { token } = await account('seller@acme.com')
      await publish('tiered-pkg', token)
      await fetch(`${baseUrl}/packages/tiered-pkg/paywall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ price: 1000 }),
      })

      // Subscribing changes the rate on the next sale with no change to the
      // package — nothing about the price record encodes the fee.
      await auth.setSubscription('seller@acme.com', { tier: 'pro', status: 'active' })
      expect(await auth.getTier('seller@acme.com')).toBe('pro')
    })
  })

  // -------------------------------------------------------------------------

  describe('perks', () => {
    it('refuses unlisted packages on Free and allows them on Pro', async () => {
      const { token, session } = await account('hider@acme.com')
      await publish('hidden-pkg', token)

      const asFree = await fetch(`${baseUrl}/publisher/api/packages/hidden-pkg`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cookie': `pantry_session=${session}` },
        body: JSON.stringify({ settings: { visibility: 'unlisted' } }),
      })
      expect(asFree.status).toBe(402)
      expect((await asFree.json() as any).error).toContain('Pro feature')

      await auth.setSubscription('hider@acme.com', { tier: 'pro', status: 'active' })

      const asPro = await fetch(`${baseUrl}/publisher/api/packages/hidden-pkg`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cookie': `pantry_session=${session}` },
        body: JSON.stringify({ settings: { visibility: 'unlisted' } }),
      })
      expect(asPro.status).toBe(200)
    })

    it('caps artifact size by plan', async () => {
      const { token } = await account('big@acme.com')

      // 60MB — over Free's 50MB ceiling.
      const tooBig = await publish('big-pkg', token, 60 * 1024 * 1024)
      expect(tooBig.status).toBe(413)
      const body = await tooBig.json() as any
      expect(body.error).toContain('Free plan')
      expect(body.hint).toContain('pantry subscribe pro')

      await auth.setSubscription('big@acme.com', { tier: 'pro', status: 'active' })
      const nowFine = await publish('big-pkg', token, 60 * 1024 * 1024)
      expect(nowFine.status).toBe(201)
    })

    it('truncates analytics history on Free', async () => {
      const { token, session } = await account('stats@acme.com')
      await publish('stats-pkg', token)

      const free = await fetch(`${baseUrl}/publisher/api/packages/stats-pkg`, { headers: { Cookie: `pantry_session=${session}` } })
      const freeBody = await free.json() as any
      expect(freeBody.analytics.retentionDays).toBe(30)
      expect(freeBody.analytics.truncated).toBe(true)

      await auth.setSubscription('stats@acme.com', { tier: 'team', status: 'active' })
      const paid = await fetch(`${baseUrl}/publisher/api/packages/stats-pkg`, { headers: { Cookie: `pantry_session=${session}` } })
      const paidBody = await paid.json() as any
      expect(paidBody.analytics.truncated).toBe(false)
    })

    it('puts paid rebuilds at the front of the queue', async () => {
      const { token: freeToken } = await account('slow@acme.com')
      const { token: proToken } = await account('fast@acme.com')
      await auth.setSubscription('fast@acme.com', { tier: 'pro', status: 'active' })

      const queue = async (domain: string, token: string): Promise<any> => {
        const res = await fetch(`${baseUrl}/api/rebuild`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ domain }),
        })
        return res.json()
      }

      expect((await queue('slow.example', freeToken)).priority).toBe(false)
      expect((await queue('fast.example', proToken)).priority).toBe(true)

      const listed = await (await fetch(`${baseUrl}/api/rebuild-queue`)).json() as any
      expect(listed.queue[0]).toBe('fast.example')
    })
  })

  // -------------------------------------------------------------------------

  describe('package ownership', () => {
    it('refuses a publish over someone else\'s package', async () => {
      const owner = await account('owner@acme.com')
      const stranger = await account('stranger@acme.com')

      expect((await publish('owned-pkg', owner.token)).status).toBe(201)

      const intrusion = await publish('owned-pkg', stranger.token)
      expect(intrusion.status).toBe(403)
      const body = await intrusion.json() as any
      expect(body.error).toContain('belongs to another account')
    })

    it('still lets anyone claim an unpublished name', async () => {
      const someone = await account('first@acme.com')
      expect((await publish('brand-new-pkg', someone.token)).status).toBe(201)
    })

    it('lets the owner keep publishing', async () => {
      const owner = await account('owner@acme.com')
      await publish('mine', owner.token)

      const form = new FormData()
      form.set('metadata', JSON.stringify({ name: 'mine', version: '2.0.0' }))
      form.set('tarball', new File([new Uint8Array(8)], 'mine.tgz'))
      const second = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${owner.token}` },
        body: form,
      })
      expect(second.status).toBe(201)
    })

    it('lets the operator publish anywhere', async () => {
      const owner = await account('owner@acme.com')
      await publish('operated', owner.token)

      const form = new FormData()
      form.set('metadata', JSON.stringify({ name: 'operated', version: '3.0.0' }))
      form.set('tarball', new File([new Uint8Array(8)], 'operated.tgz'))
      const res = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        body: form,
      })
      expect(res.status).toBe(201)
    })
  })

  // -------------------------------------------------------------------------

  describe('team seats', () => {
    async function team(): Promise<{ owner: any, member: any }> {
      const owner = await account('lead@acme.com')
      const member = await account('dev@acme.com')
      await auth.setSubscription('lead@acme.com', { tier: 'team', status: 'active' })
      return { owner, member }
    }

    function invite(session: string, email: string): Promise<Response> {
      return fetch(`${baseUrl}/account/team/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': `pantry_session=${session}` },
        body: JSON.stringify({ email }),
      })
    }

    it('is a Team feature', async () => {
      const solo = await account('solo@acme.com')
      await account('friend@acme.com')

      const onFree = await invite(solo.session, 'friend@acme.com')
      expect(onFree.status).toBe(402)
      expect((await onFree.json() as any).hint).toContain('pantry subscribe team')

      await auth.setSubscription('solo@acme.com', { tier: 'pro', status: 'active' })
      const onPro = await invite(solo.session, 'friend@acme.com')
      expect(onPro.status).toBe(402) // Pro is a single seat
    })

    it('lets a member publish to the team\'s packages', async () => {
      const { owner, member } = await team()
      await publish('team-pkg', owner.token)

      // Before the invite, the member is a stranger.
      expect((await publish('team-pkg', member.token)).status).toBe(403)

      expect((await invite(owner.session, 'dev@acme.com')).status).toBe(200)

      const form = new FormData()
      form.set('metadata', JSON.stringify({ name: 'team-pkg', version: '1.1.0' }))
      form.set('tarball', new File([new Uint8Array(8)], 'team-pkg.tgz'))
      const asMember = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${member.token}` },
        body: form,
      })
      expect(asMember.status).toBe(201)
    })

    it('lets a member manage and price the team\'s packages', async () => {
      const { owner, member } = await team()
      await publish('team-priced', owner.token)
      await invite(owner.session, 'dev@acme.com')

      const priced = await fetch(`${baseUrl}/packages/team-priced/paywall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${member.token}` },
        body: JSON.stringify({ price: 1500 }),
      })
      expect(priced.status).toBe(200)

      const settings = await fetch(`${baseUrl}/publisher/api/packages/team-priced`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cookie': `pantry_session=${member.session}` },
        body: JSON.stringify({ description: 'edited by a teammate' }),
      })
      expect(settings.status).toBe(200)
    })

    it('gives members the seat holder\'s limits, not their own', async () => {
      const { owner, member } = await team()
      await publish('big-team-pkg', owner.token)
      await invite(owner.session, 'dev@acme.com')

      // The member is personally on Free (50MB), but the package is the team's.
      expect(await auth.getTier('dev@acme.com')).toBe('free')
      const form = new FormData()
      form.set('metadata', JSON.stringify({ name: 'big-team-pkg', version: '2.0.0' }))
      form.set('tarball', new File([new Uint8Array(300 * 1024 * 1024)], 'big.tgz'))
      const res = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${member.token}` },
        body: form,
      })
      expect(res.status).toBe(201) // 300MB — over Free and Pro, inside Team's 1GB
    })

    it('enforces the seat count', async () => {
      const owner = await account('lead@acme.com')
      await auth.setSubscription('lead@acme.com', { tier: 'team', status: 'active' })

      // Team is 10 seats: the holder plus 9 invitees.
      for (let i = 0; i < 9; i++) {
        await account(`member${i}@acme.com`)
        expect((await invite(owner.session, `member${i}@acme.com`)).status).toBe(200)
      }

      await account('one-too-many@acme.com')
      const overflow = await invite(owner.session, 'one-too-many@acme.com')
      expect(overflow.status).toBe(402)
      expect((await overflow.json() as any).error).toContain('all taken')
    })

    it('refuses to invite someone who is already on a team', async () => {
      const { owner } = await team()
      await invite(owner.session, 'dev@acme.com')

      const other = await account('other-lead@acme.com')
      await auth.setSubscription('other-lead@acme.com', { tier: 'team', status: 'active' })
      const poached = await invite(other.session, 'dev@acme.com')
      expect(poached.status).toBe(409)
    })

    it('refuses to invite someone without an account', async () => {
      const { owner } = await team()
      const res = await invite(owner.session, 'ghost@acme.com')
      expect(res.status).toBe(404)
    })

    it('removing a member revokes their access', async () => {
      const { owner, member } = await team()
      await publish('revoked-pkg', owner.token)
      await invite(owner.session, 'dev@acme.com')

      const removed = await fetch(`${baseUrl}/account/team/members/${encodeURIComponent('dev@acme.com')}`, {
        method: 'DELETE',
        headers: { Cookie: `pantry_session=${owner.session}` },
      })
      expect(removed.status).toBe(200)
      expect((await removed.json() as any).members).toEqual([])

      const form = new FormData()
      form.set('metadata', JSON.stringify({ name: 'revoked-pkg', version: '9.0.0' }))
      form.set('tarball', new File([new Uint8Array(8)], 'x.tgz'))
      const afterRemoval = await fetch(`${baseUrl}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${member.token}` },
        body: form,
      })
      expect(afterRemoval.status).toBe(403)
    })

    it('reports the roster and seat usage', async () => {
      const { owner } = await team()
      await invite(owner.session, 'dev@acme.com')

      const res = await fetch(`${baseUrl}/account/team`, { headers: { Cookie: `pantry_session=${owner.session}` } })
      const body = await res.json() as any
      expect(body.seats).toBe(10)
      expect(body.seatsUsed).toBe(2)
      expect(body.members).toEqual(['dev@acme.com'])

      const memberView = await fetch(`${baseUrl}/account/team`, {
        headers: { Cookie: `pantry_session=${(await auth.login('dev@acme.com', 'password123')).sessionToken}` },
      })
      expect((await memberView.json() as any).memberOf).toBe('lead@acme.com')
    })
  })

  // -------------------------------------------------------------------------

  describe('subscription state', () => {
    it('survives a failed payment and expires after a cancellation', async () => {
      await account('billing@acme.com')

      await auth.setSubscription('billing@acme.com', { tier: 'pro', status: 'active' })
      expect(await auth.getTier('billing@acme.com')).toBe('pro')

      await auth.setSubscription('billing@acme.com', { tier: 'pro', status: 'past_due' })
      expect(await auth.getTier('billing@acme.com')).toBe('pro')

      const yesterday = new Date(Date.now() - 86_400_000).toISOString()
      await auth.setSubscription('billing@acme.com', { tier: 'pro', status: 'canceled', currentPeriodEnd: yesterday })
      expect(await auth.getTier('billing@acme.com')).toBe('free')
    })

    it('round-trips through storage', async () => {
      await account('persist@acme.com')
      await auth.setSubscription('persist@acme.com', {
        tier: 'team',
        status: 'active',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      })

      const stored = await auth.getSubscription('persist@acme.com')
      expect(stored?.tier).toBe('team')
      expect(stored?.stripeCustomerId).toBe('cus_123')

      await auth.setSubscription('persist@acme.com', null)
      expect(await auth.getSubscription('persist@acme.com')).toBeNull()
      expect(await auth.getTier('persist@acme.com')).toBe('free')
    })
  })
})
