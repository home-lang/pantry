/**
 * Paywall — gates package downloads behind Stripe payments.
 *
 * Publisher flow:
 *   POST /packages/{name}/paywall  — configure price (requires publish token)
 *   DELETE /packages/{name}/paywall — remove paywall
 *
 * Consumer flow:
 *   GET tarball → 402 with checkout URL if unpaid
 *   GET /packages/{name}/checkout?token=xxx → Stripe Checkout session
 *   Stripe webhook → grants access token
 *
 * CLI sends `Authorization: Bearer <token>` on install.
 * Token is stored in `~/.pantry/auth` or `PANTRY_TOKEN` env var.
 */

import type { MetadataStorage, PackagePaywall, PackageAccessGrant } from './types'

// ---------------------------------------------------------------------------
// Stripe helpers (lazy-loaded, only when STRIPE_SECRET_KEY is set)
// ---------------------------------------------------------------------------

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

async function stripeRequest(method: string, path: string, body?: Record<string, any>): Promise<any> {
  if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured')

  const url = `https://api.stripe.com/v1${path}`
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
  }

  let fetchBody: string | undefined
  if (body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    fetchBody = new URLSearchParams(
      Object.entries(body).flatMap(([k, v]): [string, string][] => {
        if (Array.isArray(v)) return v.map((item, i) => [`${k}[${i}]`, String(item)] as [string, string])
        return [[k, String(v)] as [string, string]]
      }),
    ).toString()
  }

  const res = await fetch(url, { method, headers, body: fetchBody })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Stripe ${method} ${path} failed (${res.status}): ${err}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Check access
// ---------------------------------------------------------------------------

export async function checkPaywallAccess(
  storage: MetadataStorage,
  packageName: string,
  version: string,
  authToken: string | null,
): Promise<{ allowed: boolean, paywall?: PackagePaywall, reason?: string }> {
  const paywall = await storage.getPaywall(packageName)

  // No paywall or disabled → allow
  if (!paywall || !paywall.enabled) {
    return { allowed: true }
  }

  // Version is marked as free → allow
  if (paywall.freeVersions?.includes(version)) {
    return { allowed: true, paywall }
  }

  // No auth token → blocked
  if (!authToken) {
    return { allowed: false, paywall, reason: 'Authentication required for paid package' }
  }

  // Check if token has been granted access
  const grant = await storage.getAccessGrant(packageName, authToken)
  if (grant) {
    return { allowed: true, paywall }
  }

  return { allowed: false, paywall, reason: 'Payment required' }
}

// ---------------------------------------------------------------------------
// Configure paywall (publisher)
// ---------------------------------------------------------------------------

export async function configurePaywall(
  storage: MetadataStorage,
  packageName: string,
  config: { price: number, currency?: string, freeVersions?: string[], trialDays?: number },
): Promise<PackagePaywall> {
  const now = new Date().toISOString()
  const existing = await storage.getPaywall(packageName)

  let stripeProductId = existing?.stripeProductId
  let stripePriceId = existing?.stripePriceId

  // Create Stripe product + price if Stripe is configured
  if (STRIPE_SECRET_KEY) {
    if (!stripeProductId) {
      const product = await stripeRequest('POST', '/products', {
        name: packageName,
        description: `Access to ${packageName} package`,
        metadata: { pantry_package: packageName },
      })
      stripeProductId = product.id
    }

    // Always create a new price (Stripe prices are immutable)
    const price = await stripeRequest('POST', '/prices', {
      product: stripeProductId,
      unit_amount: String(config.price),
      currency: config.currency || 'usd',
    })
    stripePriceId = price.id
  }

  const paywall: PackagePaywall = {
    name: packageName,
    enabled: true,
    price: config.price,
    currency: config.currency || 'usd',
    stripeProductId,
    stripePriceId,
    freeVersions: config.freeVersions,
    trialDays: config.trialDays,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }

  await storage.putPaywall(paywall)
  return paywall
}

// ---------------------------------------------------------------------------
// Create checkout session
// ---------------------------------------------------------------------------

export async function createCheckoutSession(
  storage: MetadataStorage,
  packageName: string,
  accessToken: string,
  baseUrl: string,
): Promise<{ url: string }> {
  const paywall = await storage.getPaywall(packageName)
  if (!paywall || !paywall.enabled) {
    throw new Error('Package does not have a paywall')
  }

  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured — set STRIPE_SECRET_KEY')
  }

  if (!paywall.stripePriceId) {
    throw new Error('Stripe price not configured for this package')
  }

  const session = await stripeRequest('POST', '/checkout/sessions', {
    mode: 'payment',
    'line_items[0][price]': paywall.stripePriceId,
    'line_items[0][quantity]': '1',
    success_url: `${baseUrl}/packages/${encodeURIComponent(packageName)}/checkout/success?token=${accessToken}`,
    cancel_url: `${baseUrl}/packages/${encodeURIComponent(packageName)}`,
    'metadata[package_name]': packageName,
    'metadata[access_token]': accessToken,
    ...(paywall.stripeAccountId ? { 'payment_intent_data[transfer_data][destination]': paywall.stripeAccountId } : {}),
  })

  return { url: session.url }
}

// ---------------------------------------------------------------------------
// Handle Stripe webhook
// ---------------------------------------------------------------------------

export async function handleStripeWebhook(
  storage: MetadataStorage,
  rawBody: string,
  signature: string,
): Promise<{ processed: boolean }> {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured')
  }

  // Verify webhook signature
  const event = await verifyStripeWebhook(rawBody, signature)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const packageName = session.metadata?.package_name
    const accessToken = session.metadata?.access_token

    if (packageName && accessToken) {
      const grant: PackageAccessGrant = {
        packageName,
        token: accessToken,
        stripePaymentId: session.payment_intent || session.id,
        grantedAt: new Date().toISOString(),
      }
      await storage.putAccessGrant(grant)
      return { processed: true }
    }
  }

  return { processed: false }
}

async function verifyStripeWebhook(rawBody: string, signature: string): Promise<any> {
  // Parse Stripe signature header: t=timestamp,v1=hash
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const timestamp = parts.t
  const expectedSig = parts.v1

  if (!timestamp || !expectedSig) {
    throw new Error('Invalid Stripe signature format')
  }

  // Compute expected signature
  const payload = `${timestamp}.${rawBody}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(STRIPE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const computedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

  // Use constant-time comparison to prevent timing attacks
  const computedBuf = Buffer.from(computedSig)
  const expectedBuf = Buffer.from(expectedSig)
  if (computedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(computedBuf, expectedBuf)) {
    throw new Error('Stripe webhook signature verification failed')
  }

  // Check timestamp freshness (5 minute tolerance)
  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (age > 300) {
    throw new Error('Stripe webhook timestamp too old')
  }

  try {
    return JSON.parse(rawBody)
  }
  catch {
    throw new Error('Invalid webhook body JSON')
  }
}

// ---------------------------------------------------------------------------
// Format price for display
// ---------------------------------------------------------------------------

export function formatPrice(price: number, currency: string): string {
  const amount = price / 100
  const symbol = currency === 'usd' ? '$' : currency === 'eur' ? '€' : currency === 'gbp' ? '£' : `${currency.toUpperCase()} `
  return `${symbol}${amount.toFixed(2)}`
}
