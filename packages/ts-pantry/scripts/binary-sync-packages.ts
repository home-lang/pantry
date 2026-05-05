import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface BinarySyncPackageConfig {
  domains: string[]
  requiredPlatforms?: Record<string, string[]>
  allowEmptyDomains?: string[]
}

const configPath = join(import.meta.dir, '..', 'binary-sync-packages.json')
const config = JSON.parse(readFileSync(configPath, 'utf-8')) as BinarySyncPackageConfig

export const BINARY_SYNC_DOMAINS: readonly string[] = Object.freeze([...config.domains])
export const BINARY_SYNC_DOMAIN_SET: ReadonlySet<string> = new Set(BINARY_SYNC_DOMAINS)
export const BINARY_SYNC_REQUIRED_PLATFORMS: Readonly<Record<string, string[]>> = Object.freeze({ ...(config.requiredPlatforms || {}) })
export const BINARY_SYNC_ALLOW_EMPTY_DOMAIN_SET: ReadonlySet<string> = new Set(config.allowEmptyDomains || [])

export function isBinarySyncDomain(domain: string): boolean {
  return BINARY_SYNC_DOMAIN_SET.has(domain)
}

export function sanitizeDomainList(input: string): string[] {
  return input
    .split(',')
    .map(domain => domain.trim().replace(/[^a-zA-Z0-9._\-/]/g, ''))
    .filter(Boolean)
}

export function classifyDomains(domains: string[]): { binary: string[], source: string[] } {
  const binary: string[] = []
  const source: string[] = []

  for (const domain of domains) {
    if (isBinarySyncDomain(domain)) binary.push(domain)
    else source.push(domain)
  }

  return { binary, source }
}
