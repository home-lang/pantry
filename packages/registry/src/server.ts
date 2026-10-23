import { resolve, dirname, relative } from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { installRegistryShutdown } from './shutdown'
import type { RegistryConfig, AuthStorage } from './types'
import { Registry, createLocalRegistry, createRegistryFromEnv } from './registry'
import { createAnalytics, type AnalyticsStorage, type AnalyticsCategory } from './analytics'
import { handleZigRoutes, createZigStorage } from './zig-routes'
import type { ZigPackageStorage } from './zig'
import { handlePhpRoutes, createPhpStorage } from './php-routes'
import type { PhpPackageStorage } from './php'
import { getPackagistCount, searchPackagist, fetchFromPackagist } from './packagist-fallback'
import { createS3Client, resolveStorageProvider } from './storage/provider'
import { isS3ObjectNotFound } from './storage/aws-client'
import { augmentMetadataWithPkgx, isPendingMaterialize, materializeFromPkgx } from './pkgx-fallback'
import { ObjectAnalytics } from './storage/object-analytics'
import { BuildStatusStore } from './storage/build-status'
import {
  configurePaywall,
  createBillingPortalSession,
  createCheckoutSession,
  createSubscriptionCheckout,
  formatPrice,
  handleStripeWebhook,
  isEntitled,
  paymentsEnabled,
  resolveAccess,
  validatePriceConfig,
  type PriceConfig,
  type SubscriptionChange,
} from './paywall'
import {
  calculateFee,
  DISCOVERY_FEE_BPS,
  formatBps,
  TIERS,
  tierDefinition,
  tierOf,
  type SaleOrigin,
  type Tier,
  type TierDefinition,
} from './subscriptions'
import {
  generateSparkline,
  generateLineChart,
  generateHorizontalBarChart,
  generateMultiLineChart,
  formatCount as chartFormatCount,
} from './charts'
import { AuthService, AuthError, createAuthStorage, isUserApiToken } from './auth'
import {
  enforceReadAccess,
  isSignupEmailAllowed,
  registryInfo,
  resolveVisibility,
  signupsEnabled,
  type ReaderIdentity,
} from './access'
import { pluginResponse } from './plugins'
import { MirrorStore, normalizeEntries } from './mirror'
import { normalizePolicy, SecurityStore } from './security'
import { buildSbom, parseFormat } from './sbom'
import { loadPackageVersions, loadSupportedPlatforms as loadRecipePlatforms } from './catalog'
import { BoundedAsyncCache, BoundedTtlCache } from './runtime-cache'
import { binaryRateLimiterFromEnv, rateLimitClientKey } from './binary-rate-limit'
import { EgressLedger } from './egress'
import { ObjectSnapshot } from './storage/object-snapshot'
import {
  createMalwareScannerFromEnv,
  DualUsePolicyError,
  malwareScanFailureResponse,
  malwareScanMetrics,
  publicScanResult,
  scanPackageArtifact,
  validateDualUsePackage,
  type MalwareScanner,
} from './malware-scanning'
import {
  BinaryArtifactPublisher,
  BinaryPublishError,
  S3BinaryArtifactStore,
  binaryAttestationKey,
  binaryPublishErrorResponse,
  filterBinaryMetadataForCleanScans,
  publicBinaryMetadata,
} from './binary-publishing'

// Build domain→versions lookup from ts-pantry package metadata for version
// validation. Exposed via reloadKnownVersions() so an operator can refresh
// the map after a hot-deploy of only the package index without restarting
// the service.
// Package-name → canonical-domain aliases (bun / bun.com → bun.sh), read at runtime
// from the ts-pantry aliases file (a cross-package import would violate the registry's
// tsconfig rootDir, so we parse the literal map like the recipe/version loaders do).
const _aliases = new Map<string, string>()
function loadAliases(): void {
  try {
    const file = resolve(
      typeof import.meta.dirname === 'string' ? import.meta.dirname : dirname(fileURLToPath(import.meta.url)),
      '../../ts-pantry/src/packages/aliases.ts',
    )
    const src = readFileSync(file, 'utf8')
    _aliases.clear()
    for (const m of src.matchAll(/['"]([^'"\n]+)['"]\s*:\s*['"]([^'"\n]+)['"]/g))
      _aliases.set(m[1], m[2])
    console.log(`Loaded ${_aliases.size} package aliases`)
  }
  catch (err) {
    console.warn('Could not load package aliases:', err)
  }
}
loadAliases()

const _knownVersions = new Map<string, Set<string>>()
async function loadKnownVersions(): Promise<void> {
  try {
    const packagesRoot = resolve(
      typeof import.meta.dirname === 'string' ? import.meta.dirname : dirname(fileURLToPath(import.meta.url)),
      '../../ts-pantry/src/packages',
    )
    const next = loadPackageVersions(packagesRoot)
    _knownVersions.clear()
    for (const [k, v] of next) _knownVersions.set(k, v)
    console.log(`Loaded ${_knownVersions.size} packages for version validation`)
  }
  catch (err) {
    console.warn('Could not load ts-pantry package metadata for version validation:', err)
  }
}
await loadKnownVersions()

// domain -> platforms the package targets, derived from each recipe's
// `platforms` constraint and mapped to the 4 dashboard build platforms. Absent
// ⇒ supports all four. Lets the dashboard call a macOS-only package "complete"
// once it has its darwin binaries, instead of forever short of "all 4".
const _supportedPlatforms = new Map<string, string[]>()
async function loadSupportedPlatforms(): Promise<void> {
  try {
    const recipesDir = resolve(
      typeof import.meta.dirname === 'string' ? import.meta.dirname : dirname(fileURLToPath(import.meta.url)),
      '../../ts-pantry/src/recipes',
    )
    const next = loadRecipePlatforms(recipesDir)
    _supportedPlatforms.clear()
    for (const [k, v] of next) _supportedPlatforms.set(k, v)
    console.log(`Loaded ${_supportedPlatforms.size} platform-constrained packages`)
  }
  catch (err) {
    console.warn('Could not load recipe platform constraints:', err)
  }
}
await loadSupportedPlatforms()
// SIGUSR2 triggers a non-intrusive reload (SIGUSR1 is reserved by Bun for
// internal use). Operators can `kill -SIGUSR2 $(pidof pantry-registry)`.
process.on('SIGUSR2', () => {
  console.log('SIGUSR2 received — reloading known versions map')
  Promise.all([loadKnownVersions(), loadSupportedPlatforms()])
    .then(() => { if (_buildStatus) seedKnownPackages(_buildStatus) })
    .catch(err => console.error('Reload failed:', err))
})

function isKnownVersion(domain: string, version: string): boolean {
  const versions = _knownVersions.get(domain)
  if (!versions) return false // Unknown package — don't track
  return versions.has(version)
}

// Resolve dashboard pages directory relative to this file
const __dirname = typeof import.meta.dirname === 'string'
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url))
const DASHBOARD_DIR = resolve(__dirname, '../dashboard/pages')
const SITE_DIR = resolve(__dirname, '../site/pages')
const SITE_LAYOUT = resolve(SITE_DIR, 'layout.stx')
const SITE_COMPONENTS = resolve(__dirname, '../site/components')

/** Desktop apps available in the registry (macOS .app bundles) */
const DESKTOP_APPS: Array<{ domain: string, label: string, desc: string, category: string }> = [
  // Editors & IDEs
  { domain: 'code.visualstudio.com', label: 'Visual Studio Code', desc: 'Source code editor by Microsoft', category: 'Development' },
  { domain: 'cursor.com', label: 'Cursor', desc: 'AI-powered code editor', category: 'Development' },
  { domain: 'zed.dev', label: 'Zed', desc: 'High-performance code editor', category: 'Development' },
  // Terminals
  { domain: 'ghostty.org', label: 'Ghostty', desc: 'Fast, native terminal emulator', category: 'Development' },
  { domain: 'warp.dev', label: 'Warp', desc: 'Modern terminal with AI', category: 'Development' },
  { domain: 'iterm2.com', label: 'iTerm2', desc: 'Terminal emulator for macOS', category: 'Development' },
  // Dev Tools
  { domain: 'docker.com/desktop', label: 'Docker Desktop', desc: 'Container development platform', category: 'Development' },
  { domain: 'orbstack.dev', label: 'OrbStack', desc: 'Fast Docker & Linux on macOS', category: 'Development' },
  { domain: 'tableplus.com', label: 'TablePlus', desc: 'Database management GUI', category: 'Development' },
  { domain: 'dbeaver.io', label: 'DBeaver', desc: 'Universal database tool', category: 'Development' },
  { domain: 'postman.com', label: 'Postman', desc: 'API development platform', category: 'Development' },
  { domain: 'bruno.app', label: 'Bruno', desc: 'Open-source API client', category: 'Development' },
  // Browsers
  { domain: 'firefox.org', label: 'Firefox', desc: 'Open-source web browser', category: 'Browsers' },
  { domain: 'brave.com', label: 'Brave', desc: 'Privacy-focused browser', category: 'Browsers' },
  { domain: 'arc.net', label: 'Arc', desc: 'Browser built for power users', category: 'Browsers' },
  // Communication
  { domain: 'discord.com', label: 'Discord', desc: 'Voice, video & text chat', category: 'Communication' },
  { domain: 'slack.com', label: 'Slack', desc: 'Team messaging platform', category: 'Communication' },
  { domain: 'signal.org', label: 'Signal', desc: 'Private messaging', category: 'Communication' },
  { domain: 'telegram.org', label: 'Telegram', desc: 'Cloud-based messaging', category: 'Communication' },
  { domain: 'whatsapp.com', label: 'WhatsApp', desc: 'Messaging app', category: 'Communication' },
  { domain: 'element.io', label: 'Element', desc: 'Matrix messaging client', category: 'Communication' },
  // AI
  { domain: 'ollama.com', label: 'Ollama', desc: 'Run LLMs locally', category: 'AI' },
  { domain: 'lmstudio.ai', label: 'LM Studio', desc: 'Desktop LLM app', category: 'AI' },
  // Productivity
  { domain: 'obsidian.md', label: 'Obsidian', desc: 'Knowledge base & notes', category: 'Productivity' },
  { domain: 'notion.so', label: 'Notion', desc: 'All-in-one workspace', category: 'Productivity' },
  { domain: 'linear.app', label: 'Linear', desc: 'Project management tool', category: 'Productivity' },
  { domain: 'raycast.com', label: 'Raycast', desc: 'Productivity launcher', category: 'Productivity' },
  { domain: '1password.com', label: '1Password', desc: 'Password manager', category: 'Security' },
  { domain: 'bitwarden.com', label: 'Bitwarden', desc: 'Open-source password manager', category: 'Security' },
  { domain: 'keepassxc.org', label: 'KeePassXC', desc: 'Offline password manager', category: 'Security' },
  // Media
  { domain: 'spotify.com', label: 'Spotify', desc: 'Music streaming', category: 'Media' },
  { domain: 'vlc.app', label: 'VLC', desc: 'Media player', category: 'Media' },
  { domain: 'iina.io', label: 'IINA', desc: 'Modern media player for macOS', category: 'Media' },
  { domain: 'handbrake.fr', label: 'HandBrake', desc: 'Video transcoder', category: 'Media' },
  // Design
  { domain: 'figma.com', label: 'Figma', desc: 'Collaborative design tool', category: 'Design' },
  { domain: 'inkscape.org', label: 'Inkscape', desc: 'Vector graphics editor', category: 'Design' },
  { domain: 'gimp.org', label: 'GIMP', desc: 'Image editor', category: 'Design' },
  { domain: 'blender.org', label: 'Blender', desc: '3D creation suite', category: 'Design' },
  // Utilities
  { domain: 'rectangle.app', label: 'Rectangle', desc: 'Window management', category: 'Utilities' },
  { domain: 'karabiner-elements.pqrs.org', label: 'Karabiner-Elements', desc: 'Keyboard customizer', category: 'Utilities' },
  { domain: 'cleanshot.com', label: 'CleanShot X', desc: 'Screenshot tool', category: 'Utilities' },
  { domain: 'alttab.app', label: 'AltTab', desc: 'Window switcher', category: 'Utilities' },
  { domain: 'stats.app', label: 'Stats', desc: 'System monitor in menu bar', category: 'Utilities' },
  { domain: 'maccy.app', label: 'Maccy', desc: 'Clipboard manager', category: 'Utilities' },
  { domain: 'monitorcontrol.app', label: 'MonitorControl', desc: 'Display brightness control', category: 'Utilities' },
  { domain: 'hiddenbar.app', label: 'Hidden Bar', desc: 'Hide menu bar items', category: 'Utilities' },
  { domain: 'meetingbar.app', label: 'MeetingBar', desc: 'Calendar in menu bar', category: 'Utilities' },
  { domain: 'keka.io', label: 'Keka', desc: 'File archiver', category: 'Utilities' },
  // Office
  { domain: 'libreoffice.org', label: 'LibreOffice', desc: 'Office suite', category: 'Office' },
  // VPN
  { domain: 'tunnelblick.net', label: 'Tunnelblick', desc: 'OpenVPN client', category: 'VPN & Security' },
]

/**
 * Curated desktop fonts pantry publishes to its registry (binaries/<domain>/…),
 * installed natively the same way as apps (download tarball → ~/Library/Fonts).
 * Domains follow the `<slug>.font` convention. Keep in sync with the recipes in
 * ts-pantry/src/recipes/<domain>.ts.
 */
const DESKTOP_FONTS: Array<{ domain: string, label: string, desc: string, category: string }> = [
  // Monospace / coding
  { domain: 'jetbrains-mono', label: 'JetBrains Mono', desc: 'Typeface for developers', category: 'Monospace' },
  { domain: 'fira-code', label: 'Fira Code', desc: 'Monospaced font with programming ligatures', category: 'Monospace' },
  { domain: 'cascadia-code', label: 'Cascadia Code', desc: "Microsoft's monospaced coding font", category: 'Monospace' },
  { domain: 'source-code-pro', label: 'Source Code Pro', desc: "Adobe's monospaced coding font", category: 'Monospace' },
  { domain: 'hack', label: 'Hack', desc: 'A typeface designed for source code', category: 'Monospace' },
  { domain: 'ibm-plex-mono', label: 'IBM Plex Mono', desc: "IBM's monospaced typeface", category: 'Monospace' },
  { domain: 'geist-mono', label: 'Geist Mono', desc: "Vercel's monospaced typeface", category: 'Monospace' },
  { domain: 'meslo-lg-nerd-font', label: 'MesloLG Nerd Font', desc: 'Meslo patched with Nerd Font glyphs', category: 'Nerd Fonts' },
  { domain: 'jetbrains-mono-nerd-font', label: 'JetBrainsMono Nerd Font', desc: 'JetBrains Mono patched with Nerd Font glyphs', category: 'Nerd Fonts' },
  // Sans / UI
  { domain: 'inter', label: 'Inter', desc: 'Typeface designed for screens', category: 'Sans Serif' },
  { domain: 'geist', label: 'Geist', desc: "Vercel's sans-serif typeface", category: 'Sans Serif' },
  { domain: 'roboto', label: 'Roboto', desc: "Google's signature sans-serif", category: 'Sans Serif' },
  { domain: 'open-sans', label: 'Open Sans', desc: 'Humanist sans-serif typeface', category: 'Sans Serif' },
  { domain: 'lato', label: 'Lato', desc: 'Sans-serif typeface family', category: 'Sans Serif' },
  { domain: 'ibm-plex-sans', label: 'IBM Plex Sans', desc: "IBM's sans-serif typeface", category: 'Sans Serif' },
]

/** Featured packages shown on the homepage */
const FEATURED_PACKAGES = [
  { domain: 'bun.sh', label: 'Bun', desc: 'JavaScript runtime & toolkit' },
  { domain: 'curl.se', label: 'curl', desc: 'Command line data transfer' },
  { domain: 'python.org', label: 'Python', desc: 'Programming language' },
  { domain: 'nodejs.org', label: 'Node.js', desc: 'JavaScript runtime' },
  { domain: 'go.dev', label: 'Go', desc: 'Programming language' },
  { domain: 'ruby-lang.org', label: 'Ruby', desc: 'Programming language' },
  { domain: 'cmake.org', label: 'CMake', desc: 'Build system generator' },
  { domain: 'openssl.org', label: 'OpenSSL', desc: 'TLS/SSL toolkit' },
  { domain: 'redis.io', label: 'Redis', desc: 'In-memory data store' },
  { domain: 'postgresql.org', label: 'PostgreSQL', desc: 'Relational database' },
  { domain: 'nginx.org', label: 'nginx', desc: 'Web server & reverse proxy' },
  { domain: 'sqlite.org', label: 'SQLite', desc: 'Embedded SQL database' },
  { domain: 'ffmpeg.org', label: 'FFmpeg', desc: 'Multimedia framework' },
  { domain: 'rust-lang.org', label: 'Rust', desc: 'Systems programming language' },
  { domain: 'deno.land', label: 'Deno', desc: 'Secure JavaScript runtime' },
  { domain: 'git-scm.org', label: 'Git', desc: 'Version control system' },
]

// ============================================================================
// Render helpers — uses @stacksjs/stx
// ============================================================================

type RenderTemplate = typeof import('@stacksjs/stx/render')['renderTemplate']
const stxRenderer: { promise: Promise<RenderTemplate> | null } = { promise: null }
function getRenderTemplate(): Promise<RenderTemplate> {
  stxRenderer.promise ??= import('@stacksjs/stx/render').then(module => module.renderTemplate)
  return stxRenderer.promise
}

async function renderSitePage(file: string, context: Record<string, unknown> = {}): Promise<string> {
  const title = (context.title as string) || 'pantry'
  const renderTemplate = await getRenderTemplate()
  let html = await renderTemplate(resolve(SITE_DIR, file), {
    context: { ...context, title },
    layout: SITE_LAYOUT,
    options: { componentsDir: SITE_COMPONENTS },
    injectCSS: true,
    wrapInDocument: false,
  })
  // Strip STX-injected default meta tags that duplicate our custom ones in layout.stx.
  // STX auto-generates bare meta tags (no leading whitespace) — ours are indented.
  // Match only lines starting with < (no leading whitespace) to preserve our indented versions.
  html = html.replace(/^<meta[^>]*content="A website built with stx templating engine"[^>]*>\n?/gm, '')
  html = html.replace(/^<meta property="og:title" content="[^"]*">\n?/gm, '')
  html = html.replace(/^<meta name="twitter:title" content="[^"]*">\n?/gm, '')
  return html
}

async function renderDashboardPage(file: string, context: Record<string, unknown> = {}): Promise<string> {
  const renderTemplate = await getRenderTemplate()
  return renderTemplate(resolve(DASHBOARD_DIR, file), {
    context,
    injectCSS: true,
  })
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/**
 * Publish-time name validation. Enforces npm's 214-char cap, the same charset
 * our S3 keys assume, and blocks reserved names that could confuse clients.
 */
const RESERVED_PACKAGE_NAMES = new Set(['__proto__', 'constructor', 'prototype', 'node_modules', 'favicon.ico'])
function validatePublishName(name: unknown): string | null {
  if (!name || typeof name !== 'string' || !name.trim()) return 'Package name is required'
  if (name.length > 214) return 'Package name exceeds 214 characters'
  // Accept scoped (@scope/pkg) or plain names; reject anything with control
  // chars, spaces, or shell metacharacters.
  if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(name)) {
    return 'Package name contains invalid characters'
  }
  if (RESERVED_PACKAGE_NAMES.has(name.toLowerCase())) return 'Package name is reserved'
  return null
}

function validatePublishVersion(version: unknown): string | null {
  if (!version || typeof version !== 'string' || !version.trim()) return 'Package version is required'
  if (version.length > 64) return 'Version string exceeds 64 characters'
  if (!/^[a-zA-Z0-9._+-]+$/.test(version)) return 'Version contains invalid characters'
  return null
}

/**
 * Bound metadata fields so a published package can't balloon storage with
 * a 10 MB description or an unbounded keywords array.
 */
function validateMetadataLimits(metadata: any): string | null {
  if (metadata.description && typeof metadata.description === 'string' && metadata.description.length > 2000) {
    return 'Description exceeds 2000 characters'
  }
  if (metadata.keywords) {
    if (!Array.isArray(metadata.keywords)) return 'keywords must be an array'
    if (metadata.keywords.length > 50) return 'keywords array exceeds 50 entries'
    for (const kw of metadata.keywords) {
      if (typeof kw !== 'string' || kw.length > 50) return 'each keyword must be a string of at most 50 characters'
    }
  }
  if (metadata.homepage && typeof metadata.homepage === 'string' && metadata.homepage.length > 512) {
    return 'homepage URL exceeds 512 characters'
  }
  return null
}

function sanitizeUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) return ''
  return trimmed
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  })
}

interface CachedResponse {
  body: string
  headers: [string, string][]
  status: number
  statusText: string
}

const PUBLIC_PAGE_CACHE_BYTES = 16 * 1024 * 1024
const publicPageCache = new BoundedAsyncCache<string, CachedResponse>(
  128,
  60_000,
  Date.now,
  PUBLIC_PAGE_CACHE_BYTES,
  snapshot => (snapshot.body.length + snapshot.headers.reduce((sum, [key, value]) => sum + key.length + value.length, 0)) * 2,
)

async function cachedPublicResponse(key: string, load: () => Promise<Response>): Promise<Response> {
  const snapshot = await publicPageCache.getOrCreate(key, async () => {
    const response = await load()
    return {
      body: await response.text(),
      headers: [...response.headers.entries()],
      status: response.status,
      statusText: response.statusText,
    }
  })
  return new Response(snapshot.body, {
    headers: snapshot.headers,
    status: snapshot.status,
    statusText: snapshot.statusText,
  })
}

const categorySlugMap: Record<string, AnalyticsCategory> = {
  'install': 'install',
  'install-on-request': 'install_on_request',
  'build-error': 'build_error',
}

/**
 * Create the registry HTTP server
 *
 * API Endpoints (compatible with pantry Zig client):
 * GET  /packages/{name}           - Get latest package metadata
 * GET  /packages/{name}/{version} - Get specific version metadata
 * GET  /packages/{name}/{version}/tarball - Download tarball
 * GET  /packages/{name}/versions  - List all versions
 * GET  /search?q={query}          - Search packages
 * GET  /desktop-apps              - List all desktop apps (optional ?category=)
 * GET  /fonts                     - List all desktop fonts (optional ?category=)
 * POST /publish                   - Publish package (multipart/form-data)
 * GET  /health                    - Health check
 *
 * Analytics endpoints:
 * GET  /analytics/{name}          - Get package download stats
 * GET  /analytics/{name}/timeline - Get download timeline (last 30 days)
 * GET  /analytics/{name}/requested-versions - Get most-requested missing versions
 * GET  /analytics/top             - Get top downloaded packages
 * GET  /analytics/{category}/{period} - Category analytics (install, install-on-request, build-error)
 * GET  /api/analytics/{category}/{period}.json - Category analytics (JSON API)
 * POST /analytics/events          - Report analytics event
 *
 * Commit publish endpoints (pkg-pr-new equivalent):
 * POST /publish/commit                       - Publish packages from a commit
 * GET  /commits/{sha}                        - List packages for a commit
 * GET  /commits/{sha}/{name}                 - Get commit package metadata
 * GET  /commits/{sha}/{name}/tarball         - Download commit tarball
 *
 * Zig package endpoints:
 * GET  /zig/packages/{name}                  - Get Zig package metadata
 * GET  /zig/packages/{name}/{version}        - Get specific version
 * GET  /zig/packages/{name}/{version}/tarball - Download tarball
 * GET  /zig/packages/{name}/versions         - List versions
 * GET  /zig/hash/{hash}                      - Lookup by content hash
 * GET  /zig/search?q={query}                 - Search Zig packages
 * POST /zig/publish                          - Publish Zig package
 *
 * npm/registry bulk operations:
 * POST /npm/resolve                    - Resolve all transitive deps from input constraints
 * POST /registry/download              - Download registry tarballs as one tar stream
 * POST /npm/download                   - Compatibility alias for /registry/download
 * GET  /npm/resolve/{specs}            - GET variant (comma-separated name@constraint pairs)
 *
 * Binary proxy (pantry CLI install):
 * POST /api/v1/binaries/uploads                              - Create untrusted staged upload
 * POST /api/v1/binaries/uploads/complete                     - Scan and promote staged upload
 * POST /api/v1/binaries/rescan                               - Attest or quarantine a retained artifact
 * POST /api/v1/binaries/quarantine/rescan/prepare             - Prepare an operator quarantine review
 * POST /api/v1/binaries/quarantine/rescan/attest              - Apply a digest-bound quarantine review
 * GET  /binaries/{domain}/metadata.json                        - Package metadata (5min cache)
 * GET  /binaries/{domain}/{version}/{platform}/{file}.tar.gz   - Tarball download (24h cache, tracked)
 * GET  /binaries/{domain}/{version}/{platform}/{file}.sha256   - Checksum (24h cache)
 *
 * Dashboard:
 * GET  /dashboard            - Analytics overview (auth required)
 * GET  /dashboard/package/*  - Package detail (auth required)
 * GET  /dashboard/login      - Login page
 */
/**
 * Create the request handler (shared between Bun server and Lambda)
 */
/**
 * Interface for fetching binary data from storage (S3 in prod, mock in tests)
 */
export interface BinaryStorage {
  /** Confirm absence with S3RequestError/NoSuchKey; other failures remain retryable. */
  getObject(key: string): Promise<Buffer>
  createDownloadUrl?(key: string): string
}

// Build dashboard status store — lazily created against the active storage
// provider, loaded once. Tracks live builds, recent outcomes, the rebuild queue,
// and per-platform coverage (derived from the binaries/ prefix).
let _buildStatus: BuildStatusStore | null = null
/** Seed the build-status store with the full known-package catalog so the
 *  dashboard lists every package, not only ones that already have binaries. */
function seedKnownPackages(s: BuildStatusStore): void {
  const map = new Map<string, string[]>()
  for (const [domain, versions] of _knownVersions)
    map.set(domain, [...versions])
  s.setKnownPackages(map)
  s.setSupportedPlatforms(new Map(_supportedPlatforms))
}

function getBuildStatus(): BuildStatusStore {
  if (!_buildStatus) {
    const storage = resolveStorageProvider()
    _buildStatus = new BuildStatusStore(createS3Client(storage), process.env.S3_BUCKET || 'pantry-registry')
    const s = _buildStatus
    seedKnownPackages(s)
    s.load()
      // Warm the coverage cache in the background so the first /api/packages
      // request never waits on the full binaries/ listing.
      .then(() => s.refreshCoverage())
      .catch(e => console.error('build-status init failed:', (e as Error).message))
  }
  return _buildStatus
}

interface GitHubActionRun {
  id: number
  name: string
  displayTitle: string
  status: string
  conclusion: string | null
  headSha: string
  createdAt: string
  htmlUrl: string
}

interface GitHubActionsStatus {
  repository: string
  running: number
  queued: number
  recent: GitHubActionRun[]
  generatedAt: string
  error?: string
}

let _githubActionsCache: { at: number, data: GitHubActionsStatus } | null = null
const GITHUB_ACTIONS_TTL_MS = 30_000

function githubActionsFromBuildEvents(repository: string): GitHubActionsStatus | null {
  const status = getBuildStatus().getStatus()
  const byRun = new Map<string, GitHubActionRun>()
  const events = [
    ...(Array.isArray(status.building) ? status.building : []),
    ...(Array.isArray(status.recent) ? status.recent : []),
  ]

  for (const event of events) {
    if (event.hostKind !== 'github' || !event.hostUrl)
      continue

    const id = Number(event.hostUrl.match(/\/actions\/runs\/(\d+)/)?.[1] || 0)
    if (!id)
      continue

    const existing = byRun.get(event.hostUrl)
    const createdAt = new Date(event.ts || Date.now()).toISOString()
    const isBuilding = event.state === 'building'
    const conclusion = event.state === 'failed' ? 'failure' : event.state === 'built' ? 'success' : null
    const next: GitHubActionRun = {
      id,
      name: 'Build Download Recipes',
      displayTitle: 'Build Download Recipes',
      status: isBuilding ? 'in_progress' : 'completed',
      conclusion,
      headSha: '',
      createdAt,
      htmlUrl: event.hostUrl,
    }

    if (!existing || new Date(existing.createdAt).getTime() < (event.ts || 0)) {
      if (existing?.status === 'in_progress' && !isBuilding) {
        next.status = 'in_progress'
        next.conclusion = null
      }
      byRun.set(event.hostUrl, next)
    }
  }

  const recent = [...byRun.values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12)
  if (recent.length === 0)
    return null

  return {
    repository,
    running: recent.filter(run => run.status === 'in_progress').length,
    queued: 0,
    recent,
    generatedAt: new Date().toISOString(),
    error: 'GitHub API unavailable; using build-event fallback',
  }
}

async function getGitHubActionsStatus(): Promise<GitHubActionsStatus> {
  const now = Date.now()
  if (_githubActionsCache && now - _githubActionsCache.at < GITHUB_ACTIONS_TTL_MS)
    return _githubActionsCache.data

  const repository = process.env.GITHUB_REPOSITORY || process.env.PANTRY_GITHUB_REPOSITORY || 'pantry-pm/pantry'
  const data: GitHubActionsStatus = {
    repository,
    running: 0,
    queued: 0,
    recent: [],
    generatedAt: new Date(now).toISOString(),
  }
  let apiRecent: GitHubActionRun[] = []
  let apiError: string | undefined
  try {
    const token = process.env.GITHUB_TOKEN || process.env.PAT_TOKEN || process.env.GH_TOKEN
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'pantry-registry-build-status',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (token)
      headers.Authorization = `Bearer ${token}`
    const res = await fetch(`https://api.github.com/repos/${repository}/actions/runs?branch=main&per_page=12`, { headers })
    if (!res.ok)
      throw new Error(`GitHub API ${res.status}`)
    const json = await res.json() as any
    const runs = Array.isArray(json.workflow_runs) ? json.workflow_runs : []
    apiRecent = runs.map((run: any) => ({
      id: Number(run.id || 0),
      name: String(run.name || ''),
      displayTitle: String(run.display_title || run.name || ''),
      status: String(run.status || ''),
      conclusion: run.conclusion == null ? null : String(run.conclusion),
      headSha: String(run.head_sha || ''),
      createdAt: String(run.created_at || ''),
      htmlUrl: String(run.html_url || ''),
    })).filter((run: GitHubActionRun) => run.id && run.status)
    data.queued = apiRecent.filter(run => run.status === 'queued' || run.status === 'waiting' || run.status === 'requested').length
  }
  catch (err) {
    apiError = (err as Error).message
  }

  // Always FOLD IN runs derived from live build events. The registry box has no
  // GITHUB_TOKEN, so the unauthenticated API (60 req/hr) is frequently rate-limited
  // and returns nothing — which used to show "GitHub Actions: 0" even while github
  // runners were actively reporting builds. Merging the build-event signal keeps the
  // running count accurate regardless of the API; an in_progress status from either
  // source wins.
  const merged = new Map<number, GitHubActionRun>()
  for (const run of [...apiRecent, ...(githubActionsFromBuildEvents(repository)?.recent || [])]) {
    const prev = merged.get(run.id)
    if (!prev || (prev.status !== 'in_progress' && run.status === 'in_progress'))
      merged.set(run.id, run)
  }
  data.recent = [...merged.values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12)
  data.running = data.recent.filter(run => run.status === 'in_progress').length
  if (apiError && data.recent.length === 0)
    data.error = apiError
  _githubActionsCache = { at: now, data }
  return data
}

// The /packages dashboard shell is identical for every visitor (data is loaded
// client-side via /api/*), but stx render + crosswind CSS injection costs ~4s.
// Render it once and serve the cached HTML; a deploy restarts the process and
// clears this.
let _packagesPageHtml: string | null = null
async function renderPackagesPage(): Promise<string> {
  if (_packagesPageHtml === null) {
    _packagesPageHtml = await renderSitePage('packages.stx', {
      title: 'Packages & Builds',
      metaDescription: 'Browse every pantry package, see per-platform build coverage and live build activity, and trigger rebuilds.',
      canonicalUrl: 'https://pantry.dev/packages',
    })
  }
  return _packagesPageHtml
}

export function createHandler(
  registry: Registry,
  analyticsStorage: AnalyticsStorage,
  zigPackageStorage: ZigPackageStorage,
  baseUrl: string,
  binaryStorage?: BinaryStorage,
  phpPackageStorage?: PhpPackageStorage,
  authService?: AuthService,
  internalBaseUrl: string = baseUrl,
  malwareScanner: MalwareScanner = createMalwareScannerFromEnv(),
  injectedBinaryPublisher?: BinaryArtifactPublisher,
  injectedBuildStatus?: BuildStatusStore,
): (req: Request) => Promise<Response> {
  const getReadyBuildStatus = async (): Promise<BuildStatusStore> => {
    const store = injectedBuildStatus || getBuildStatus()
    await store.ready()
    return store
  }
  let binaryPublisher = injectedBinaryPublisher
  const getBinaryPublisher = (): BinaryArtifactPublisher => {
    if (binaryPublisher) return binaryPublisher
    const secret = process.env.PANTRY_BINARY_STAGING_SECRET || getRegistryToken() || ''
    const storage = resolveStorageProvider()
    const store = new S3BinaryArtifactStore(
      createS3Client(storage),
      process.env.S3_BUCKET || 'pantry-registry',
    )
    binaryPublisher = new BinaryArtifactPublisher(store, malwareScanner, {
      tokenSecret: secret,
      maxBytes: Number.parseInt(process.env.CLAMD_MAX_BYTES || '', 10) || undefined,
      legacyRescanMaxBytes: Number.parseInt(process.env.PANTRY_LEGACY_RESCAN_MAX_BYTES || '', 10) || undefined,
      legacyScanAttestationCutoff: (() => {
        const value = process.env.PANTRY_LEGACY_SCAN_ATTESTATION_CUTOFF?.trim()
        if (!value) return undefined
        const parsed = Date.parse(value)
        if (!Number.isFinite(parsed))
          throw new Error('PANTRY_LEGACY_SCAN_ATTESTATION_CUTOFF must be an ISO-8601 timestamp')
        return parsed
      })(),
      onPublished: async (result) => {
        const first = Object.values(result.platforms)[0]
        for (const record of Object.values(result.platforms))
          _binaryAttestationCache.delete(record.tarball)
        invalidateBinaryMetadata(result.domain)
        await registry.metadata.putVersion(result.domain, result.version, {
          name: result.domain,
          version: result.version,
          tarballUrl: `${baseUrl}/${first.tarball}`,
          checksum: first.sha256,
          publishedAt: first.uploadedAt,
          size: first.size,
          malwareScan: first.malwareScan,
        })
      },
    })
    return binaryPublisher
  }

  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url)
    const path = url.pathname

    // CORS headers for browser access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // What this registry is, and whether callers need a credential. Public
      // even on a private registry: a client that gets a 401 needs somewhere to
      // find out why, and `curl <registry>/api/registry-info` is that place.
      if (path === '/api/registry-info' && req.method === 'GET') {
        return Response.json(registryInfo(process.env, baseUrl), {
          headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
        })
      }

      // Visibility gate. On a private registry every path that isn't explicitly
      // public requires a credential — metadata, tarballs, binaries, search and
      // the web UI alike. On a public one this only runs plugin access policies.
      // It is deliberately the first thing after CORS: a route added below is
      // covered by default rather than by remembering to gate it.
      const denied = await enforceReadAccess(req, url, { identify: identifyReader, corsHeaders })
      if (denied) return denied

      // Plugins get first refusal on every request, so a fork can add or
      // override routes without editing this file.
      const fromPlugin = await pluginResponse(req, { url, path, method: req.method, visibility: resolveVisibility() })
      if (fromPlugin) return fromPlugin

      // CLI user-agent detection — serve install script for curl/wget/etc.
      const ua = req.headers.get('user-agent') || ''
      const isCLI = /^(curl|wget|httpie|fetch|libfetch|powershell)/i.test(ua) || !ua

      if (isCLI && (path === '/' || path === '')) {
        try {
          const script = await Bun.file(resolve(__dirname, '../../../public/install.sh')).text()
          return new Response(script, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
        }
        catch {
          return new Response('Install script not found', { status: 404 })
        }
      }

      // Health check
      if (path === '/health') {
        return Response.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          malwareScanning: {
            enabled: malwareScanner.enabled,
            required: malwareScanner.required,
          },
        }, { headers: corsHeaders })
      }

      // Readiness includes the scanner because production publication fails
      // closed when it is unavailable. Keep /health as a process-liveness check.
      if (path === '/ready') {
        const scannerHealth = await malwareScanner.health()
        const ready = !scannerHealth.required || scannerHealth.ready
        return Response.json({
          status: ready ? 'ready' : 'not-ready',
          timestamp: new Date().toISOString(),
          malwareScanning: scannerHealth,
        }, { status: ready ? 200 : 503, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
      }

      if (path === '/api/security/malware-scanning' && req.method === 'GET') {
        return Response.json({
          metrics: malwareScanMetrics(),
          health: await malwareScanner.health(),
        }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
      }

      if (path === '/api/v1/binaries/uploads' && req.method === 'POST') {
        return handleBinaryUploadInitiate(req, getBinaryPublisher, corsHeaders)
      }

      if (path === '/api/v1/binaries/uploads/complete' && req.method === 'POST') {
        return handleBinaryUploadComplete(req, getBinaryPublisher, corsHeaders)
      }

      if (path === '/api/v1/binaries/rescan' && req.method === 'POST') {
        return handleBinaryRescan(req, getBinaryPublisher, corsHeaders)
      }

      if (path === '/api/v1/binaries/rescan/prepare' && req.method === 'POST') {
        return handleBinaryExternalRescanPrepare(req, getBinaryPublisher, corsHeaders)
      }

      if (path === '/api/v1/binaries/rescan/attest' && req.method === 'POST') {
        return handleBinaryExternalRescanAttest(req, getBinaryPublisher, corsHeaders)
      }

      if (path === '/api/v1/binaries/quarantine/rescan/prepare' && req.method === 'POST') {
        return handleBinaryQuarantineReviewPrepare(req, getBinaryPublisher, corsHeaders)
      }

      if (path === '/api/v1/binaries/quarantine/rescan/attest' && req.method === 'POST') {
        return handleBinaryQuarantineReviewAttest(req, getBinaryPublisher, corsHeaders)
      }

      // ================================================================
      // Build dashboard API (/packages page)
      // ================================================================
      // Full package table: per-platform coverage + live building state.
      if (path === '/api/packages' && req.method === 'GET') {
        const data = await (await getReadyBuildStatus()).getPackages()
        return Response.json(data, { headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=15' } })
      }
      // Live build status: what's building now, recent outcomes, rebuild queue.
      // Aggregate only — no per-client breakdown — so this is
      // the same class of information as the download counts already on /stats.
      if (path === '/api/egress' && req.method === 'GET') {
        return Response.json(getEgressLedger().snapshot(), {
          headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=60' },
        })
      }

      if (path === '/api/build-status' && req.method === 'GET') {
        return Response.json({
          ...(await getReadyBuildStatus()).getStatus(),
          githubActions: await getGitHubActionsStatus(),
        }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
      }
      if (path === '/api/github-actions-status' && req.method === 'GET') {
        return Response.json(await getGitHubActionsStatus(), { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
      }
      // Live build-status STREAM (Server-Sent Events). Pushes a full status
      // snapshot on connect and again on every build event / queue change, so the
      // /packages dashboard updates instantly instead of polling. A periodic
      // comment line keeps the connection alive through proxies (Caddy/nginx).
      if (path === '/api/build-events-stream' && req.method === 'GET') {
        const store = await getReadyBuildStatus()
        const encoder = new TextEncoder()
        let unsubscribe: (() => void) | null = null
        let heartbeat: ReturnType<typeof setInterval> | null = null
        const cleanup = () => {
          if (unsubscribe) {
            unsubscribe()
            unsubscribe = null
          }
          if (heartbeat) {
            clearInterval(heartbeat)
            heartbeat = null
          }
        }
        const stream = new ReadableStream({
          start(controller) {
            const send = (payload: unknown): boolean => {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
                return true
              }
              catch {
                return false // controller closed (client gone)
              }
            }
            // Initial snapshot so the page renders immediately on connect.
            send(store.getStatus())
            unsubscribe = store.subscribe((status) => {
              if (!send(status))
                cleanup()
            })
            heartbeat = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(': keepalive\n\n'))
              }
              catch {
                cleanup()
              }
            }, 25_000)
            // Stop work the moment the client disconnects.
            req.signal?.addEventListener('abort', () => {
              cleanup()
              try {
                controller.close()
              }
              catch { /* already closed */ }
            })
          },
          cancel() {
            cleanup()
          },
        })
        return new Response(stream, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            // Disable proxy buffering (nginx) so events flush immediately.
            'X-Accel-Buffering': 'no',
          },
        })
      }
      // Builders report progress here (building/built/failed). Authenticated so
      // outsiders can't inject fake build status — builders send the registry
      // token (see report-build.ts). Best-effort on the builder side.
      if (path === '/api/build-events' && req.method === 'POST') {
        if (!(await isAuthorizedRequest(req)))
          return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders })
        const body = await req.json().catch(() => null)
        if (!body)
          return Response.json({ error: 'invalid body' }, { status: 400, headers: corsHeaders })
        const events = Array.isArray(body) ? body : [body]
        let count = 0
        for (const e of events.slice(0, 200)) {
          if ((await getReadyBuildStatus()).record(e))
            count++
        }
        return Response.json({ ok: true, recorded: count }, { headers: corsHeaders })
      }
      // Queue a manual rebuild from the dashboard (drained by the build-driver).
      // Rebuilds cost real CPU/$$, so this is gated: a valid Bearer token (admin or
      // user API token) or a logged-in dashboard session is required.
      if (path === '/api/rebuild' && req.method === 'POST') {
        if (!(await isAuthorizedRequest(req)))
          return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders })
        const body = await req.json().catch(() => null) as any
        const domain = typeof body?.domain === 'string' ? body.domain : ''
        if (!/^[a-zA-Z0-9._/-]{1,128}$/.test(domain))
          return Response.json({ error: 'valid domain required' }, { status: 400, headers: corsHeaders })
        // Paid plans jump the queue. Rebuilds cost real CPU, and the wait is
        // the scarce thing, so this is the perk rather than a separate queue.
        const identity = await identifyReader(req)
        const tier = await tierForUser(identity.userId)
        const priority = identity.userId === '_admin' || tierDefinition(tier).priorityBuilds
        // Queued, not started. The sweep claims this queue every hour, which
        // is the whole mechanism — the registry starting the run itself would
        // mean holding a credential that can write to the pantry repository,
        // and a standing write credential on an internet-facing service is a
        // poor trade for turning "within the hour" into "within a minute".
        const queued = (await getReadyBuildStatus()).requestRebuild(domain, priority)
        return Response.json({ queued, domain, priority }, { headers: corsHeaders })
      }
      // The build-driver reads (and optionally clears) the rebuild queue.
      if (path === '/api/rebuild-queue' && req.method === 'GET') {
        return Response.json({ queue: (await getReadyBuildStatus()).getQueue() }, { headers: corsHeaders })
      }
      // Claim the queue: return it and empty it in one step, so the run that
      // takes the work is the only one that acts on it.
      //
      // `requestRebuild` and `clearQueue` have both existed since the queue
      // did, and nothing ever called the second one — there was no way to,
      // over HTTP. So every request accumulated and none was ever acted on:
      // the production queue had been holding `curl.se` indefinitely, and a
      // release that asked to be indexed was simply added to that pile. A
      // queue nobody drains is a queue nobody should be told to write to.
      //
      // Reading and clearing are one request rather than a GET then a DELETE
      // because two sweeps overlapping would otherwise both act on the same
      // domains, and the second would find them already gone.
      if (path === '/api/rebuild-queue/claim' && req.method === 'POST') {
        if (!(await isAuthorizedRequest(req)))
          return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders })
        const status = await getReadyBuildStatus()
        const claimed = status.getQueue()
        if (claimed.length > 0)
          status.clearQueue(claimed)
        return Response.json({ claimed, count: claimed.length }, { headers: corsHeaders })
      }
      // Requested-but-unavailable versions: versions a build attempted but that
      // don't exist upstream (no source tarball AND no prebuilt binary — every
      // attempt 404'd). These are NOT failures; they're surfaced so the dashboard
      // can show which requested versions are phantom. A version that later builds
      // successfully is reconciled out of this list (see BuildStatusStore.record).
      if (path === '/api/unavailable-versions' && req.method === 'GET') {
        const versions = (await getReadyBuildStatus()).getUnavailableVersions()
        return Response.json(
          { versions, count: versions.length, generatedAt: new Date().toISOString() },
          { headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=30' } },
        )
      }
      // Recent build-log lines for one package (the expandable per-row log panel).
      if (path.startsWith('/api/build-logs/') && req.method === 'GET') {
        const domain = decodeURIComponent(path.slice('/api/build-logs/'.length))
        if (!/^[a-zA-Z0-9._/-]{1,128}$/.test(domain))
          return Response.json({ error: 'valid domain required' }, { status: 400, headers: corsHeaders })
        return Response.json({ domain, logs: (await getReadyBuildStatus()).getLogs(domain) }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
      }
      // Builders stream batches of build-output lines here while a build runs, so
      // the per-package log panel updates live. Authenticated (registry token) so
      // outsiders can't inject fake log output. Best-effort on the builder side.
      if (path === '/api/build-logs' && req.method === 'POST') {
        if (!(await isAuthorizedRequest(req)))
          return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders })
        const body = await req.json().catch(() => null) as any
        const domain = typeof body?.domain === 'string' ? body.domain : ''
        const lines = Array.isArray(body?.lines) ? body.lines.filter((l: unknown) => typeof l === 'string') : []
        if (!/^[a-zA-Z0-9._/-]{1,128}$/.test(domain))
          return Response.json({ error: 'valid domain required' }, { status: 400, headers: corsHeaders })
        const store = await getReadyBuildStatus()
        store.recordLogs(domain, typeof body?.platform === 'string' ? body.platform : '', lines.slice(0, 500))
        return Response.json({ ok: true, recorded: Math.min(lines.length, 500) }, { headers: corsHeaders })
      }

      // ================================================================
      // Auth API routes
      // ================================================================
      if (path.startsWith('/auth/') && authService) {
        const authResponse = await handleAuthRoutes(path, req, authService, corsHeaders)
        if (authResponse) return authResponse
      }

      // Build insurance, security alerts and SBOM export
      if (authService) {
        const enterprise = await handleEnterpriseRoutes(path, req, registry, corsHeaders)
        if (enterprise) return enterprise
      }

      // Plans and billing
      if (authService && (path === '/api/plans' || path.startsWith('/account/'))) {
        const subscriptionResponse = await handleSubscriptionRoutes(path, req, authService, baseUrl, corsHeaders)
        if (subscriptionResponse) return subscriptionResponse
      }

      // Member + token administration (private registries onboard people here)
      if (path.startsWith('/admin/') && authService) {
        const adminResponse = await handleAdminRoutes(path, req, authService, corsHeaders)
        if (adminResponse) return adminResponse
      }

      // Pricing page. Rendered server-side from the same tier table the API
      // serves, so the page and the invoice can never disagree.
      if (path === '/pricing' && req.method === 'GET') {
        return cachedPublicResponse('pricing', async () => {
          const html = await renderSitePage('pricing.stx', {
            title: 'Plans',
            metaDescription: 'Publishing and installing on pantry is free. Selling a package costs a fee per sale — 10% on Free, 5% on a plan — and a plan also insures your builds, watches your lockfile and unlocks private packages.',
            canonicalUrl: 'https://pantry.dev/pricing',
            plans: Object.values(TIERS).map(t => ({
              id: t.id,
              name: t.name,
              featured: t.id === 'pro',
              formattedPrice: t.price === 0 ? 'Free' : `$${(t.price / 100).toFixed(0)}/mo`,
              sellingFee: formatBps(t.commissionBps),
              tagline: t.id === 'free'
                ? 'Publish and sell, no cost'
                : t.id === 'pro'
                  ? 'For people who ship'
                  : 'For teams who depend on it',
              // What you get as a publisher…
              publishing: [
                t.privatePackages ? 'Private & unlisted packages' : 'Public packages',
                t.analyticsRetentionDays >= 3650 ? 'Lifetime full analytics' : '30 days of full analytics',
                `${Math.round(t.maxArtifactBytes / (1024 * 1024))}MB artifacts`,
                t.priorityBuilds ? 'Priority builds' : 'Standard build queue',
                t.seats > 1 ? `${t.seats} seats, shared packages` : '1 seat',
              ],
              // …and as a consumer.
              consuming: [
                t.buildInsurance ? 'Build insurance — every artifact mirrored' : 'Standard downloads',
                t.securityAlerts ? 'Continuous CVE & licence alerts' : 'Point-in-time `pantry audit`',
                t.sbomExport ? 'SBOM export (CycloneDX, SPDX)' : 'No SBOM export',
                t.teamEntitlements ? 'Paid packages bought once for the whole team' : 'Purchases are per account',
              ],
            })),
            discoveryFee: formatBps(DISCOVERY_FEE_BPS),
            paymentsEnabled: paymentsEnabled(),
          })
          return htmlResponse(html)
        })
      }

      // Site auth pages (login, signup, account)
      if (authService && (path === '/login' || path === '/signup' || path === '/account')) {
        return handleSiteAuth(path, req, authService, corsHeaders)
      }

      // Publisher dashboard (API + site)
      if (authService) {
        const publisherApi = await handlePublisherApi(path, req, registry, analyticsStorage, authService, corsHeaders)
        if (publisherApi) return publisherApi
        const publisherSite = await handlePublisherSite(path, req, authService, corsHeaders)
        if (publisherSite) return publisherSite
      }

      // Desktop apps listing — returns all desktop apps with live version info from S3
      if (path === '/desktop-apps' && req.method === 'GET') {
        const category = url.searchParams.get('category') || ''
        const results = await Promise.allSettled(
          DESKTOP_APPS
            .filter(app => !category || app.category.toLowerCase() === category.toLowerCase())
            .map(async (app) => {
              try {
                const meta = await fetchPackageMetadata(app.domain, binaryStorage)
                return {
                  ...app,
                  version: meta?.latestVersion || null,
                  platforms: meta?.latestVersion
                    ? Object.keys(meta.versions?.[meta.latestVersion]?.platforms || {})
                    : [],
                  installed: false,
                }
              }
              catch {
                return { ...app, version: null, platforms: [], installed: false }
              }
            }),
        )
        const apps = results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
        const categories = [...new Set(DESKTOP_APPS.map(a => a.category))].sort()
        return Response.json({
          apps,
          categories,
          total: apps.length,
          totalAvailable: DESKTOP_APPS.length,
        }, {
          headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=300' },
        })
      }

      if (path === '/fonts' && req.method === 'GET') {
        const category = url.searchParams.get('category') || ''
        const results = await Promise.allSettled(
          DESKTOP_FONTS
            .filter(font => !category || font.category.toLowerCase() === category.toLowerCase())
            .map(async (font) => {
              try {
                const meta = await fetchPackageMetadata(font.domain, binaryStorage)
                return {
                  ...font,
                  version: meta?.latestVersion || null,
                  platforms: meta?.latestVersion
                    ? Object.keys(meta.versions?.[meta.latestVersion]?.platforms || {})
                    : [],
                  installed: false,
                }
              }
              catch {
                return { ...font, version: null, platforms: [], installed: false }
              }
            }),
        )
        const fonts = results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
        const categories = [...new Set(DESKTOP_FONTS.map(f => f.category))].sort()
        return Response.json({
          fonts,
          categories,
          total: fonts.length,
          totalAvailable: DESKTOP_FONTS.length,
        }, {
          headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=300' },
        })
      }

      // Search — serve HTML for browsers, JSON for API clients / instant search
      if (path === '/search' && req.method === 'GET') {
        const accept = req.headers.get('accept') || ''
        const format = url.searchParams.get('format')
        // Serve JSON if format=json (instant search) or Accept: application/json (API clients)
        const wantsJson = format === 'json' || (accept.includes('application/json') && !accept.includes('text/html'))
        if (wantsJson) {
          const query = (url.searchParams.get('q') || '').slice(0, 256)
          const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)
          const results = await registry.search(query, Math.min(limit, 50))
          return Response.json({ results }, { headers: corsHeaders })
        }
        // Default to HTML for browsers
        const q = (url.searchParams.get('q') || '').slice(0, 256)
        const rawSort = url.searchParams.get('sort') || 'relevance'
        const sort = ['relevance', 'downloads', 'name', 'newest'].includes(rawSort) ? rawSort : 'relevance'
        const rawView = url.searchParams.get('view') || 'list'
        const view = ['list', 'grid', 'table'].includes(rawView) ? rawView : 'list'
        const rawType = url.searchParams.get('type') || 'all'
        const type = ['all', 'system', 'zig', 'php', 'npm'].includes(rawType) ? rawType : 'all'
        const page = Math.min(Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1), 10000)
        const cacheKey = `search:${JSON.stringify([q, sort, view, type, page])}`
        return cachedPublicResponse(cacheKey, () =>
          handleSiteSearch(q, registry, binaryStorage, analyticsStorage, sort, view, type, zigPackageStorage, page, phpPackageStorage))
      }

      // Publish
      if (path === '/publish' && req.method === 'POST') {
        return handlePublish(req, registry, corsHeaders, malwareScanner)
      }

      // Stripe webhook
      if (path === '/webhooks/stripe' && req.method === 'POST') {
        const signature = req.headers.get('stripe-signature')
        if (!signature) {
          return Response.json({ error: 'Missing stripe-signature header' }, { status: 400, headers: corsHeaders })
        }
        try {
          const rawBody = await req.text()
          const result = await handleStripeWebhook(
            registry.metadata,
            rawBody,
            signature,
            // Subscription events move an account between plans. Stripe is the
            // source of truth: we mirror what it reports rather than deciding.
            authService
              ? async (change: SubscriptionChange) => {
                  await authService.setSubscription(change.email, {
                    tier: tierOf(change.tier),
                    status: change.status as any,
                    stripeCustomerId: change.stripeCustomerId,
                    stripeSubscriptionId: change.stripeSubscriptionId,
                    currentPeriodEnd: change.currentPeriodEnd,
                  })
                }
              : undefined,
          )
          return Response.json(result, { headers: corsHeaders })
        }
        catch (err: any) {
          console.error('Stripe webhook error:', err)
          return Response.json({ error: 'Webhook processing failed' }, { status: 400, headers: corsHeaders })
        }
      }

      // Category analytics API (JSON endpoints)
      const categoryApiMatch = path.match(/^\/api\/analytics\/(install|install-on-request|build-error)\/(30|90|365)d\.json$/)
      if (categoryApiMatch && req.method === 'GET') {
        const category = categorySlugMap[categoryApiMatch[1]]
        if (!category) {
          return Response.json({ error: 'Unknown category' }, { status: 400, headers: corsHeaders })
        }
        const days = Number.parseInt(categoryApiMatch[2], 10) as 30 | 90 | 365
        const result = await analyticsStorage.getCategoryAnalytics(category, days)
        return Response.json(result, {
          headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
        })
      }

      // POST /analytics/events
      if (path === '/analytics/events' && req.method === 'POST') {
        return handleAnalyticsEvent(req, analyticsStorage, corsHeaders)
      }

      // Analytics routes
      const analyticsMatch = path.match(/^\/analytics(?:\/(.+))?$/)
      if (analyticsMatch && req.method === 'GET') {
        return handleAnalytics(analyticsMatch[1], url, analyticsStorage, corsHeaders)
      }

      // Short URL for commit packages (pkg-pr-new style)
      // GET /pickier@abc1234 -> serve tarball (exact match)
      // GET /@craft-native/craft@abc1234 -> serve tarball (scoped)
      // GET /craft@abc1234 -> serve tarball (alias: matches *-craft/ or craft/)
      const shortCommitMatch = path.match(/^\/(@[^/]+\/[^@]+|[^@/][^@]*)@([a-f0-9]{7,40})$/)
      if (shortCommitMatch && req.method === 'GET') {
        const pkgName = decodeURIComponent(shortCommitMatch[1])
        if (pkgName.includes('..') || /[\x00-\x1f]/.test(pkgName)) {
          return Response.json({ error: 'Invalid package name' }, { status: 400, headers: corsHeaders })
        }
        const sha = shortCommitMatch[2]
        const safeName = pkgName.replaceAll('@', '').replaceAll('/', '-').replaceAll('..', '')

        // Strategy: list S3 objects under commits/{sha} prefix and find a matching package.
        // This handles full SHA, short SHA, exact names, and aliases (e.g., "craft" -> "craft-native-craft").
        let tarball: ArrayBuffer | null = null
        try {
          // For full SHA, try exact download first (fast path)
          if (sha.length === 40) {
            tarball = await registry.downloadCommitTarball(sha, pkgName)
          }

          // If no exact match, search S3 by prefix
          if (!tarball) {
            const prefix = `commits/${sha}`
            const keys = await registry.tarball.list(prefix)

            // Try exact safe name match first, then alias (bare name as suffix)
            const matchKey = keys.find((k: string) => k.includes(`/${safeName}/`))
              || keys.find((k: string) => {
                // Alias: "craft" matches "craft-native-craft/" (ends with -craft/)
                // or "craft/" (exact dir match)
                const parts = k.split('/')
                const dir = parts[2] // commits/{sha}/{dir}/{file}.tgz
                return dir === safeName || dir?.endsWith(`-${safeName}`)
              })

            if (matchKey) {
              tarball = await registry.tarball.download(matchKey)
            }
          }
        }
        catch { /* fall through to 404 */ }

        if (tarball) {
          analyticsStorage.trackDownload({
            packageName: pkgName,
            version: sha.slice(0, 7),
            timestamp: new Date().toISOString(),
            userAgent: req.headers.get('user-agent') || undefined,
          }).catch(err => console.warn('Analytics tracking failed:', err))
          return new Response(tarball, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/gzip',
              'Content-Length': String(tarball.byteLength),
              'Content-Disposition': `attachment; filename="${safeName}-${sha.slice(0, 7)}.tgz"`,
            },
          })
        }
        return Response.json({ error: 'Commit package not found' }, { status: 404, headers: corsHeaders })
      }

      // Commit publish routes (pkg-pr-new equivalent)
      if (path === '/publish/commit' && req.method === 'POST') {
        return handleCommitPublish(req, registry, baseUrl, corsHeaders, malwareScanner)
      }

      // GET /commits/{sha} - List all packages for a commit
      // GET /commits/{sha}/{name} - Get commit package metadata
      // GET /commits/{sha}/{name}/tarball - Download commit tarball
      const commitMatch = path.match(/^\/commits\/([a-f0-9]+)(?:\/((?:@[^/]+\/[^/]+)|(?:[^@/][^/]*)))?(?:\/(tarball))?$/)
      if (commitMatch && req.method === 'GET') {
        const sha = commitMatch[1]
        const packageName = commitMatch[2] ? decodeURIComponent(commitMatch[2]) : undefined
        const action = commitMatch[3]

        // GET /commits/{sha}/{name}/tarball
        if (packageName && action === 'tarball') {
          const tarball = await registry.downloadCommitTarball(sha, packageName)
          if (!tarball) {
            return Response.json(
              { error: 'Commit package not found' },
              { status: 404, headers: corsHeaders },
            )
          }
          // Track commit tarball download
          analyticsStorage.trackDownload({
            packageName,
            version: sha.slice(0, 7),
            timestamp: new Date().toISOString(),
            userAgent: req.headers.get('user-agent') || undefined,
          }).catch(err => console.warn('Analytics tracking failed:', err))
          const safeName = packageName.replaceAll('@', '').replaceAll('/', '-').replaceAll('..', '')
          return new Response(tarball, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/gzip',
              'Content-Length': String(tarball.byteLength),
              'Content-Disposition': `attachment; filename="${safeName}-${sha.slice(0, 7)}.tgz"`,
            },
          })
        }

        // GET /commits/{sha}/{name}
        if (packageName && !action) {
          const publish = await registry.getCommitPackage(sha, packageName)
          if (!publish) {
            return Response.json(
              { error: 'Commit package not found' },
              { status: 404, headers: corsHeaders },
            )
          }
          return Response.json(publish, { headers: corsHeaders })
        }

        // GET /commits/{sha}
        if (!packageName) {
          const summary = await registry.getCommitPackages(sha)
          if (!summary) {
            return Response.json(
              { error: 'No packages found for this commit' },
              { status: 404, headers: corsHeaders },
            )
          }
          return Response.json(summary, { headers: corsHeaders })
        }
      }

      // Zig package routes
      if (path.startsWith('/zig/')) {
        const zigResponse = await handleZigRoutes(
          path,
          req,
          url,
          zigPackageStorage,
          baseUrl,
          corsHeaders,
          analyticsStorage,
          malwareScanner,
        )
        if (zigResponse) {
          return zigResponse
        }
      }

      // PHP package routes
      if (path.startsWith('/php/') && phpPackageStorage) {
        const phpResponse = await handlePhpRoutes(
          path,
          req,
          url,
          phpPackageStorage,
          baseUrl,
          corsHeaders,
          analyticsStorage,
          malwareScanner,
        )
        if (phpResponse) {
          return phpResponse
        }
      }

      // npm/registry bulk operations
      if (path === '/registry/download' && req.method === 'POST') {
        return handleRegistryDownload(req, corsHeaders, internalBaseUrl)
      }
      if (path === '/npm/download' && req.method === 'POST') {
        return handleRegistryDownload(req, corsHeaders, internalBaseUrl)
      }
      if (path === '/npm/resolve' && req.method === 'POST') {
        return handleNpmResolve(req, corsHeaders)
      }
      if (path.startsWith('/npm/resolve/') && req.method === 'GET') {
        return handleNpmResolveGet(path, corsHeaders)
      }

      // Binary proxy routes — proxy pantry binary tarballs from S3
      if (path.startsWith('/binaries/')) {
        return handleBinaryProxy(path, req, analyticsStorage, corsHeaders, binaryStorage, getBinaryPublisher)
      }

      // Dashboard routes
      if (path.startsWith('/dashboard')) {
        return handleDashboard(path, req, url, analyticsStorage, corsHeaders)
      }

      // Package routes
      const packageMatch = path.match(/^\/packages\/(@[^/]+\/[^/]+|[^/]+)(?:\/(.+))?$/)
      if (packageMatch) {
        const packageName = decodeURIComponent(packageMatch[1])
        // Reject package names with path traversal or control characters
        if (packageName.includes('..') || /[\x00-\x1f]/.test(packageName)) {
          return Response.json({ error: 'Invalid package name' }, { status: 400, headers: corsHeaders })
        }
        const rest = packageMatch[2]

        // GET /packages/{name}/versions
        if (rest === 'versions' && req.method === 'GET') {
          let versions = await registry.listVersions(packageName)
          if (versions.length === 0) {
            versions = await listBinaryPackageVersions(packageName, binaryStorage)
          }
          // Weak ETag over the version list: a publish changes the list and
          // thus the hash; clients/CDNs can revalidate cheaply with If-None-Match.
          const bodyJson = JSON.stringify({ versions })
          const etagBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(bodyJson))
          const etag = `W/"${Array.from(new Uint8Array(etagBuf)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('')}"`
          if (req.headers.get('if-none-match') === etag) {
            return new Response(null, { status: 304, headers: { ...corsHeaders, ETag: etag, 'Cache-Control': 'public, max-age=60, must-revalidate' } })
          }
          return new Response(bodyJson, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json; charset=utf-8',
              'ETag': etag,
              // Short TTL + revalidate so a publish is visible within the minute
              // rather than blocked for the previous 5-minute cache window.
              'Cache-Control': 'public, max-age=60, must-revalidate',
            },
          })
        }

        // GET /packages/{name}/paywall — price, and whether the caller owns it
        if (rest === 'paywall' && req.method === 'GET') {
          const paywall = await registry.metadata.getPaywall(packageName)
          if (!paywall || !paywall.enabled) {
            return Response.json({ enabled: false }, { headers: corsHeaders })
          }
          const identity = await identifyReader(req)
          const owned = identity.userId && identity.userId !== '_admin'
            ? await isEntitled(registry.metadata, packageName, identity.userId)
            : false
          return Response.json({
            enabled: true,
            price: paywall.price,
            currency: paywall.currency,
            formattedPrice: formatPrice(paywall.price, paywall.currency),
            freeVersions: paywall.freeVersions || [],
            owned,
            paymentsEnabled: paymentsEnabled(),
            buyUrl: `${baseUrl}/packages/${encodeURIComponent(packageName)}/buy`,
          }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
        }

        // POST /packages/{name}/paywall — set the price. The publisher only:
        // a valid publish token is not authority over someone else's package.
        if (rest === 'paywall' && req.method === 'POST') {
          const denied = await requirePackageOwner(req, registry, packageName, corsHeaders)
          if (denied) return denied

          let body: PriceConfig
          try {
            body = await req.json() as PriceConfig
          }
          catch {
            return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })
          }

          const invalid = validatePriceConfig(body)
          if (invalid) {
            return Response.json({ error: invalid }, { status: 400, headers: corsHeaders })
          }

          try {
            const paywall = await configurePaywall(registry.metadata, packageName, body)
            return Response.json({
              success: true,
              paywall: {
                enabled: paywall.enabled,
                price: paywall.price,
                currency: paywall.currency,
                formattedPrice: formatPrice(paywall.price, paywall.currency),
                freeVersions: paywall.freeVersions || [],
                payoutAccountId: paywall.stripeAccountId,
                paymentsEnabled: paymentsEnabled(),
              },
            }, { status: 200, headers: corsHeaders })
          }
          catch (err: any) {
            return Response.json({ error: err.message || 'Could not set the price' }, { status: 400, headers: corsHeaders })
          }
        }

        // DELETE /packages/{name}/paywall — stop charging (publisher only)
        if (rest === 'paywall' && req.method === 'DELETE') {
          const denied = await requirePackageOwner(req, registry, packageName, corsHeaders)
          if (denied) return denied
          await registry.metadata.deletePaywall(packageName)
          return Response.json({ success: true }, { headers: corsHeaders })
        }

        // POST /packages/{name}/checkout — the CLI's `pantry buy`. Authenticated
        // with the buyer's API token; returns a URL to open in a browser.
        if (rest === 'checkout' && req.method === 'POST') {
          const identity = await identifyReader(req)
          if (!identity.authenticated || !identity.userId || identity.userId === '_admin') {
            return Response.json(
              {
                error: 'Sign in to buy a package',
                hint: 'Create an account at /signup, then: pantry token set',
              },
              { status: 401, headers: corsHeaders },
            )
          }
          if (await isEntitled(registry.metadata, packageName, identity.userId)) {
            return Response.json({ owned: true, message: 'You already own this package' }, { headers: corsHeaders })
          }
          try {
            const session = await createCheckoutSession(registry.metadata, {
              packageName,
              email: identity.userId,
              baseUrl,
              sellerTier: await sellerTierFor(registry, authService, packageName),
              // A CLI purchase is someone who already knew what they wanted, so
              // no discovery fee. `?origin=site` marks a sale the website
              // started (see the browser flow below).
              origin: (url.searchParams.get('origin') === 'site' ? 'site' : 'cli') as SaleOrigin,
            })
            return Response.json({ url: session.url }, { headers: corsHeaders })
          }
          catch (err: any) {
            console.error('Checkout session error:', err)
            return Response.json({ error: err.message || 'Could not start checkout' }, { status: 400, headers: corsHeaders })
          }
        }

        // GET /packages/{name}/buy — the browser path: sign in, then Stripe.
        if ((rest === 'buy' || rest === 'checkout') && req.method === 'GET') {
          const sessionToken = extractSessionToken(req)
          const user = sessionToken && authService ? await authService.validateSession(sessionToken) : null
          if (!user) {
            const next = `/packages/${encodeURIComponent(packageName)}/buy`
            return new Response(null, {
              status: 302,
              headers: { ...corsHeaders, Location: `/login?next=${encodeURIComponent(next)}` },
            })
          }
          if (await isEntitled(registry.metadata, packageName, user.email)) {
            return new Response(null, {
              status: 302,
              headers: { ...corsHeaders, Location: `/packages/${encodeURIComponent(packageName)}/checkout/success` },
            })
          }
          try {
            const session = await createCheckoutSession(registry.metadata, {
              packageName,
              email: user.email,
              baseUrl,
              sellerTier: await sellerTierFor(registry, authService, packageName),
              // This route is only reached from the site's Buy button, so the
              // registry put the package in front of this buyer: discovery fee.
              origin: 'site',
            })
            return new Response(null, { status: 302, headers: { ...corsHeaders, Location: session.url } })
          }
          catch (err: any) {
            console.error('Checkout session error:', err)
            return Response.json({ error: err.message || 'Could not start checkout' }, { status: 400, headers: corsHeaders })
          }
        }

        // GET /packages/{name}/checkout/success — post-payment landing
        if (rest === 'checkout/success' && req.method === 'GET') {
          const safePackageName = escapeHtml(packageName)
          const html = `<!DOCTYPE html>
<html><head><title>Payment Successful</title></head>
<body style="font-family: system-ui; max-width: 480px; margin: 80px auto; text-align: center;">
<h1>Payment Successful</h1>
<p>You now have access to <strong>${safePackageName}</strong>.</p>
<p>Run <code>pantry install ${safePackageName}</code> to install it.</p>
</body></html>`
          return htmlResponse(html)
        }

        // GET /packages/{name}/{version}/tarball
        if (rest?.endsWith('/tarball') && req.method === 'GET') {
          const version = rest.replace('/tarball', '')
          // Whitelist version format — previously we only blocked control chars
          // which still left shell metacharacters (`;`, `$()`, backticks) as a
          // potential injection surface downstream.
          if (!version || !/^[a-zA-Z0-9._+-]+$/.test(version) || version.length > 64) {
            return Response.json({ error: 'Invalid version' }, { status: 400, headers: corsHeaders })
          }

          // Paid packages: the publisher and the operator always get through,
          // buyers get through once their account is entitled, everyone else
          // gets a 402 that says what it costs and where to buy it.
          const access = await resolvePackageAccess(req, registry, packageName, version)
          if (!access.allowed && access.paywall) {
            const buyUrl = `${baseUrl}/packages/${encodeURIComponent(packageName)}/buy`
            const priceText = formatPrice(access.paywall.price, access.paywall.currency)
            return Response.json(
              {
                error: 'Payment required',
                package: packageName,
                price: access.paywall.price,
                currency: access.paywall.currency,
                formattedPrice: priceText,
                buyUrl,
                // Kept for older clients that read `checkoutUrl`.
                checkoutUrl: buyUrl,
                message: access.reason === 'unauthenticated'
                  ? `${packageName} costs ${priceText}. Sign in and buy it with: pantry buy ${packageName}`
                  : `${packageName} costs ${priceText}. Buy it with: pantry buy ${packageName} (or open ${buyUrl})`,
              },
              { status: 402, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } },
            )
          }

          const tarball = await registry.downloadTarball(packageName, version)

          if (!tarball) {
            return Response.json(
              { error: 'Package not found' },
              { status: 404, headers: corsHeaders },
            )
          }

          // Track download
          await analyticsStorage.trackDownload({
            packageName,
            version,
            timestamp: new Date().toISOString(),
            userAgent: req.headers.get('user-agent') || undefined,
          })

          // Compute ETag from the tarball bytes so clients and CDNs can
          // short-circuit re-downloads via `If-None-Match`. The tarball is
          // immutable for a given (name, version) so a content hash is stable.
          const etagHash = await crypto.subtle.digest('SHA-256', tarball)
          const etag = `"${Array.from(new Uint8Array(etagHash)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('')}"`
          const ifNoneMatch = req.headers.get('if-none-match')
          if (ifNoneMatch === etag) {
            return new Response(null, { status: 304, headers: { ...corsHeaders, ETag: etag, 'Cache-Control': 'public, max-age=31536000, immutable' } })
          }
          return new Response(tarball, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/gzip',
              'Content-Length': String(tarball.byteLength),
              'Content-Disposition': `attachment; filename="${packageName}-${version}.tgz"`,
              'ETag': etag,
              // Immutable because (name, version) tarballs never change.
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          })
        }

        // GET /packages/{name}/{version}
        if (rest && !rest.includes('/') && req.method === 'GET') {
          const metadata = await registry.getPackage(packageName, rest)
          if (!metadata) {
            // Track all missing version requests, tagging whether the version is known
            analyticsStorage.trackMissingVersion(
              packageName,
              rest,
              req.headers.get('user-agent') || undefined,
              isKnownVersion(packageName, rest),
            ).catch(err => console.warn('Analytics tracking failed:', err))
            return Response.json(
              { error: 'Package version not found' },
              { status: 404, headers: corsHeaders },
            )
          }
          return Response.json(metadata, { headers: corsHeaders })
        }

        // GET /packages/{name}
        if (!rest && req.method === 'GET') {
          const metadata = await registry.getPackage(packageName)
          if (!metadata) {
            return Response.json(
              { error: 'Package not found' },
              { status: 404, headers: corsHeaders },
            )
          }
          return Response.json(metadata, { headers: corsHeaders })
        }
      }

      // ================================================================
      // Site routes — public pantry.dev pages
      // ================================================================

      // Homepage
      if (path === '/' || path === '') {
        return cachedPublicResponse('home', () => handleSiteHome(binaryStorage, analyticsStorage, zigPackageStorage))
      }

      // Package detail page
      const sitePkgMatch = path.match(/^\/package\/(.+)$/)
      if (sitePkgMatch) {
        const name = decodeURIComponent(sitePkgMatch[1])
        return cachedPublicResponse(`package:${name}`, () =>
          handleSitePackage(name, analyticsStorage, binaryStorage, registry, zigPackageStorage, phpPackageStorage))
      }

      // Compare page
      if (path === '/compare') {
        const packagesParam = url.searchParams.get('packages') || ''
        const cacheKey = packagesParam.split(',').map(name => name.trim()).filter(Boolean).slice(0, 4).join(',')
        return cachedPublicResponse(`compare:${cacheKey}`, () =>
          handleSiteCompare(packagesParam, analyticsStorage, binaryStorage))
      }

      // Stats page
      if (path === '/stats') {
        return cachedPublicResponse('stats', () => handleSiteStats(analyticsStorage))
      }

      // Fonts — serve self-hosted font files
      if (path.startsWith('/fonts/')) {
        const publicDir = resolve(__dirname, '../../../public')
        const fontPath = resolve(publicDir, path.slice(1))
        // Prevent path traversal — resolved path must stay within public dir
        if (!relative(publicDir, fontPath).startsWith('..')) {
          const fontFile = Bun.file(fontPath)
          if (await fontFile.exists()) {
            const ext = fontPath.split('.').pop()
            const mimeType = ext === 'woff' ? 'font/woff' : ext === 'ttf' ? 'font/ttf' : ext === 'otf' ? 'font/otf' : 'font/woff2'
            return new Response(fontFile, {
              headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            })
          }
        }
      }

      // Docs — serve bunpress-built static docs
      if (path === '/docs' || path.startsWith('/docs/')) {
        return await handleDocs(path)
      }

      // Settings page
      if (path === '/settings') {
        return cachedPublicResponse('settings', async () =>
          htmlResponse(await renderSitePage('settings.stx', {
            title: 'Settings',
            metaDescription: 'Customize your pantry.dev experience — theme, accent color, and preferences.',
            canonicalUrl: 'https://pantry.dev/settings',
          })))
      }

      // OpenSearch description
      if (path === '/opensearch.xml') {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>pantry</ShortName>
  <Description>Search packages on pantry.dev</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Url type="text/html" template="https://pantry.dev/search?q={searchTerms}"/>
  <Url type="application/json" template="https://pantry.dev/search?q={searchTerms}&amp;format=json&amp;limit=8"/>
</OpenSearchDescription>`
        return new Response(xml, {
          headers: { 'Content-Type': 'application/opensearchdescription+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
        })
      }

      // Badge API — generates SVG badges for packages
      if (path.startsWith('/api/badge/') && req.method === 'GET') {
        const badgeParts = path.replace('/api/badge/', '').split('/')
        const badgeType = badgeParts[0]
        const badgePkg = decodeURIComponent(badgeParts.slice(1).join('/'))
        if (!badgePkg) return Response.json({ error: 'Missing package name' }, { status: 400 })
        return await handleBadge(badgeType, badgePkg, binaryStorage, analyticsStorage)
      }

      // Static pages
      if (path === '/packages') return htmlResponse(await renderPackagesPage())
      if (path === '/about') {
        return cachedPublicResponse('about', async () =>
          htmlResponse(await renderSitePage('about.stx', { title: 'About', canonicalUrl: 'https://pantry.dev/about' })))
      }
      if (path === '/privacy') {
        return cachedPublicResponse('privacy', async () =>
          htmlResponse(await renderSitePage('privacy.stx', { title: 'Privacy Policy', canonicalUrl: 'https://pantry.dev/privacy' })))
      }
      if (path === '/accessibility') {
        return cachedPublicResponse('accessibility', async () =>
          htmlResponse(await renderSitePage('accessibility.stx', { title: 'Accessibility', canonicalUrl: 'https://pantry.dev/accessibility' })))
      }

      // API 404 (JSON) for /api/* and /packages/* paths
      if (path.startsWith('/api/') || path.startsWith('/packages/') || path.startsWith('/analytics/')) {
        return Response.json(
          { error: 'Not found' },
          { status: 404, headers: corsHeaders },
        )
      }

      // HTML 404 for everything else
      return htmlResponse(await renderSitePage('404.stx', { title: 'Not Found' }), 404)
    }
    catch (error) {
      console.error('Server error:', error)
      return Response.json(
        { error: 'Internal server error' },
        { status: 500, headers: corsHeaders },
      )
    }
  }
}

export function createServer(
  registry: Registry,
  port = 3000,
  analytics?: AnalyticsStorage,
  zigStorage?: ZigPackageStorage,
  binaryStorage?: BinaryStorage,
  phpStorage?: PhpPackageStorage,
  authStorage?: AuthStorage,
  malwareScanner: MalwareScanner = createMalwareScannerFromEnv(),
  binaryPublisher?: BinaryArtifactPublisher,
  buildStatus?: BuildStatusStore,
): { start: () => void, stop: (closeActiveConnections?: boolean) => Promise<void> } {
  let server: ReturnType<typeof Bun.serve> | null = null
  let draining: Promise<void> | null = null
  const analyticsStorage = analytics || createAnalytics()
  const zigPackageStorage = zigStorage || createZigStorage()
  const phpPackageStorage = phpStorage || createPhpStorage()
  const auth = authStorage || createAuthStorage()
  const authSvc = new AuthService(auth)
  _authService = authSvc
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`
  const internalBaseUrl = process.env.REGISTRY_INTERNAL_URL || `http://127.0.0.1:${port}`
  const handler = createHandler(
    registry,
    analyticsStorage,
    zigPackageStorage,
    baseUrl,
    binaryStorage,
    phpPackageStorage,
    authSvc,
    internalBaseUrl,
    malwareScanner,
    binaryPublisher,
    buildStatus,
  )

  const start = () => {
    if (server || draining) throw new Error('Registry server is already running or draining')
    const configuredIdleTimeout = Number.parseInt(process.env.PANTRY_HTTP_IDLE_TIMEOUT_SECONDS || '', 10)
    const idleTimeout = Number.isSafeInteger(configuredIdleTimeout)
      && configuredIdleTimeout >= 10
      && configuredIdleTimeout <= 255
      ? configuredIdleTimeout
      : 255
    server = Bun.serve({
      port,
      fetch: handler,
      // ClamAV streams can legitimately take longer than Bun's 10-second
      // default. Keep the client connection open through the scanner's bounded
      // timeout so retries cannot duplicate an in-flight scan.
      idleTimeout,
      // Bun defaults to 128MB, which would make the 250MB and 1GB artifacts the
      // paid plans advertise physically impossible to upload — the request
      // would be cut off before any of our own limits were consulted. Sized to
      // the largest plan plus multipart overhead; the per-account ceiling is
      // still enforced in the publish handler.
      maxRequestBodySize: Math.max(...Object.values(TIERS).map(t => t.maxArtifactBytes)) + 32 * 1024 * 1024,
    })

    const visibility = resolveVisibility()
    console.log(`Pantry Registry running at http://localhost:${port}`)
    console.log(
      visibility === 'private'
        ? '  Visibility: PRIVATE — every read requires a token or a logged-in session'
        : '  Visibility: public — reads are unauthenticated (set REGISTRY_VISIBILITY=private to close it)',
    )
    if (visibility === 'private' && signupsEnabled())
      console.warn('  WARNING: REGISTRY_ALLOW_SIGNUP is on — anyone can create an account and read every package')
    console.log('Endpoints:')
    console.log('  GET  /packages/{name}           - Get package metadata')
    console.log('  GET  /packages/{name}/{version} - Get specific version')
    console.log('  GET  /packages/{name}/{version}/tarball - Download tarball')
    console.log('  GET  /packages/{name}/versions  - List versions')
    console.log('  GET  /search?q={query}          - Search packages')
    console.log('  POST /publish                   - Publish package')
    console.log('  GET  /analytics/{name}          - Package download stats')
    console.log('  GET  /analytics/{name}/timeline - Download timeline')
    console.log('  GET  /analytics/{name}/requested-versions - Most-requested missing versions')
    console.log('  GET  /analytics/top             - Top downloaded packages')
    console.log('  GET  /analytics/{category}/{30d,90d,365d} - Category analytics')
    console.log('  GET  /api/analytics/{category}/{period}.json - Category analytics (JSON API)')
    console.log('  POST /analytics/events          - Report analytics event')
    console.log('  Categories: install, install-on-request, build-error')
    console.log('Commit packages (pkg-pr-new equivalent):')
    console.log('  POST /publish/commit               - Publish from a commit')
    console.log('  GET  /commits/{sha}                - List packages for a commit')
    console.log('  GET  /commits/{sha}/{name}         - Get commit package metadata')
    console.log('  GET  /commits/{sha}/{name}/tarball  - Download commit tarball')
    console.log('Zig packages:')
    console.log('  GET  /zig/packages/{name}       - Get Zig package metadata')
    console.log('  GET  /zig/packages/{name}/{version}/tarball - Download')
    console.log('PHP/Composer packages:')
    console.log('  GET  /php/packages/{vendor}/{package} - Get PHP package metadata')
    console.log('  GET  /php/packages/{vendor}/{package}/{version}/tarball - Download')
    console.log('  GET  /php/search?q={query}      - Search PHP packages')
    console.log('  POST /php/publish               - Publish PHP package')
    console.log('  GET  /zig/hash/{hash}           - Lookup by content hash')
    console.log('  GET  /zig/search?q={query}      - Search Zig packages')
    console.log('  POST /zig/publish               - Publish Zig package')
    console.log('  GET  /health                    - Health check')
    console.log('npm/registry bulk operations:')
    console.log('  POST /npm/resolve               - Resolve transitive deps')
    console.log('  POST /registry/download         - Download registry tarballs as one stream')
    console.log('  POST /npm/download              - Compatibility alias for /registry/download')
    console.log('  GET  /npm/resolve/{specs}        - GET variant (name@constraint,...)')
    console.log('Binary proxy (pantry CLI):')
    console.log('  POST /api/v1/binaries/uploads          - Stage native artifact')
    console.log('  POST /api/v1/binaries/uploads/complete - Scan and promote native artifact')
    console.log('  POST /api/v1/binaries/rescan          - Attest or quarantine retained artifact')
    console.log('  POST /api/v1/binaries/quarantine/rescan/* - Review quarantined artifact')
    console.log('  GET  /binaries/{domain}/metadata.json  - Package metadata')
    console.log('  GET  /binaries/{domain}/{ver}/{plat}/*  - Tarball/checksum')
    console.log('Dashboard:')
    console.log('  GET  /dashboard                 - Analytics overview')
    console.log('  GET  /dashboard/requested-versions - Missing version requests')
    console.log('  GET  /dashboard/package/{name}   - Package detail')
    console.log('  GET  /dashboard/login            - Login')
  }

  const stop = (closeActiveConnections = false): Promise<void> => {
    if (!server) return Promise.resolve()
    const current = server
    if (closeActiveConnections) {
      // Retain the handle while graceful drain is pending so a deadline can
      // still force its active connections closed.
      return Promise.resolve(current.stop(true)).then(() => {
        if (server === current) server = null
      })
    }
    draining ??= Promise.resolve(current.stop(false)).finally(() => {
      if (server === current) server = null
      draining = null
    })
    return draining
  }

  return { start, stop }
}

/**
 * Handle analytics requests
 */
async function handleAnalytics(
  path: string | undefined,
  url: URL,
  analytics: AnalyticsStorage,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  // GET /analytics/{category}/{30d,90d,365d}
  const categoryMatch = path?.match(/^(install|install-on-request|build-error)\/(30|90|365)d$/)
  if (categoryMatch) {
    const category = categorySlugMap[categoryMatch[1]]
    if (!category) {
      return Response.json({ error: 'Unknown category' }, { status: 400, headers: corsHeaders })
    }
    const days = Number.parseInt(categoryMatch[2], 10) as 30 | 90 | 365
    const result = await analytics.getCategoryAnalytics(category, days)
    return Response.json(result, {
      headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
    })
  }

  // GET /analytics/top
  if (path === 'top' || !path) {
    const limit = Math.min(Number.parseInt(url.searchParams.get('limit') || '10', 10), 100)
    const packages = await analytics.getTopPackages(limit)
    return Response.json({ packages }, { headers: corsHeaders })
  }

  // GET /analytics/{name}/requested-versions
  if (path.endsWith('/requested-versions')) {
    const packageName = decodeURIComponent(path.replace('/requested-versions', ''))
    const limit = Math.min(Number.parseInt(url.searchParams.get('limit') || '20', 10), 100)
    const requests = await analytics.getMissingVersionRequests(packageName, limit)
    return Response.json({ packageName, requests }, { headers: corsHeaders })
  }

  // GET /analytics/{name}/timeline
  if (path.endsWith('/timeline')) {
    const packageName = decodeURIComponent(path.replace('/timeline', ''))
    const days = Number.parseInt(url.searchParams.get('days') || '30', 10)
    const timeline = await analytics.getDownloadTimeline(packageName, days)
    return Response.json({ packageName, timeline }, { headers: corsHeaders })
  }

  // GET /analytics/{name}
  const packageName = decodeURIComponent(path)
  const stats = await analytics.getPackageStats(packageName)

  if (!stats) {
    return Response.json(
      { error: 'No analytics data for this package' },
      { status: 404, headers: corsHeaders },
    )
  }

  return Response.json(stats, { headers: corsHeaders })
}

/**
 * Handle POST /analytics/events
 */
async function handleAnalyticsEvent(
  req: Request,
  analytics: AnalyticsStorage,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  try {
    const body = await req.json() as { packageName?: string, category?: string, version?: string }
    const { packageName, category, version } = body

    if (!packageName || typeof packageName !== 'string') {
      return Response.json(
        { error: 'Missing or invalid packageName' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!category || !['install', 'install_on_request', 'build_error', 'download'].includes(category)) {
      return Response.json(
        { error: 'Missing or invalid category. Must be one of: install, install_on_request, build_error, download' },
        { status: 400, headers: corsHeaders },
      )
    }

    // 'download' category tracks both download stats and install event
    if (category === 'download') {
      await Promise.all([
        analytics.trackDownload({
          packageName,
          version: version || 'unknown',
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || undefined,
        }),
        analytics.trackEvent({
          packageName,
          category: 'install' as AnalyticsCategory,
          timestamp: new Date().toISOString(),
          version: version || undefined,
        }),
      ])
    }
    else {
      await analytics.trackEvent({
        packageName,
        category: category as AnalyticsCategory,
        timestamp: new Date().toISOString(),
        version: version || undefined,
      })
    }

    return Response.json({ success: true }, { headers: corsHeaders })
  }
  catch {
    return Response.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders },
    )
  }
}

// Legacy admin token for backward compatibility with CI workflows.
// Read lazily at request time — tests mutate process.env in beforeEach, and a
// module-load-time snapshot would lock in `undefined` before the env is set.
function getRegistryToken(): string | undefined {
  return process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN
}
if (!getRegistryToken()) {
  console.warn('WARNING: PANTRY_REGISTRY_TOKEN or PANTRY_TOKEN must be set — publish/admin endpoints will reject all requests')
}

/** Reference to the AuthService (set by createServer, used by validateToken) */
let _authService: AuthService | undefined

/**
 * Extract bearer token from Authorization header (returns null if not present)
 */
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
}

/**
 * Validate authorization token.
 * Supports both legacy REGISTRY_TOKEN and user API tokens (ptry_ prefix).
 */
async function validateToken(authHeader: string | null): Promise<{ valid: boolean, error?: string, userId?: string }> {
  if (!authHeader) {
    return { valid: false, error: 'Authorization required' }
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  const registryToken = getRegistryToken()

  // Try user API token first if AuthService is available
  if (_authService && isUserApiToken(token)) {
    const result = await _authService.validatePublishToken(token, registryToken ?? '')
    return result
  }

  // Fall back to legacy admin token (constant-time comparison to prevent timing attacks).
  // Distinguish "server isn't configured to accept publishes" from "token mismatch" —
  // the former is an operator misconfiguration (e.g. PANTRY_REGISTRY_TOKEN not set in the
  // service env after a server/host migration) and was previously indistinguishable from
  // a bad client token, which made it very hard to diagnose.
  if (!registryToken) {
    return { valid: false, error: 'Registry has no publish token configured — set PANTRY_REGISTRY_TOKEN in the registry service environment' }
  }
  const crypto = require('node:crypto')
  const maxLen = Math.max(token.length, registryToken.length)
  const tokenBuf = Buffer.alloc(maxLen)
  const registryBuf = Buffer.alloc(maxLen)
  Buffer.from(token).copy(tokenBuf)
  Buffer.from(registryToken).copy(registryBuf)
  if (!crypto.timingSafeEqual(tokenBuf, registryBuf) || token.length !== registryToken.length) {
    return { valid: false, error: 'Invalid token' }
  }

  return { valid: true, userId: '_admin' }
}

/**
 * Authorize a mutating dashboard/builder request. Accepts EITHER a valid Bearer
 * token (the legacy registry/admin token OR a user `ptry_` API token — the same
 * mechanism used for publishing) OR a logged-in web session cookie (so the
 * dashboard's own buttons work for signed-in users). Read endpoints stay public;
 * only state-changing endpoints (rebuild triggers, build-status/log ingestion)
 * go through here. Never throws — returns false on any failure.
 */
async function isAuthorizedRequest(req: Request): Promise<boolean> {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      const result = await validateToken(authHeader)
      if (result.valid)
        return true
    }
    if (_authService) {
      const sessionToken = extractSessionToken(req)
      if (sessionToken) {
        const user = await _authService.validateSession(sessionToken)
        if (user)
          return true
      }
    }
  }
  catch {
    // fall through to unauthorized
  }
  return false
}

/**
 * Resolve who is making a request, for the private-registry read gate.
 *
 * Accepts the same credentials as publishing — the shared registry token or a
 * user `ptry_` token — plus a logged-in browser session, and additionally
 * accepts read-only tokens, which are the ones you hand to consumers of a
 * private registry. Never throws: an unidentifiable caller is simply anonymous.
 */
async function identifyReader(req: Request): Promise<ReaderIdentity> {
  try {
    const authHeader = req.headers.get('authorization')
    const token = extractBearerToken(authHeader)
    if (token && _authService) {
      const result = await _authService.validateAccessToken(token, getRegistryToken() ?? '', 'read')
      if (result.valid)
        return { authenticated: true, userId: result.userId ?? null }
    }
    else if (token) {
      // No AuthService (in-memory dev server): the shared token is all there is.
      const result = await validateToken(authHeader)
      if (result.valid)
        return { authenticated: true, userId: result.userId ?? null }
    }

    if (_authService) {
      const sessionToken = extractSessionToken(req)
      if (sessionToken) {
        const user = await _authService.validateSession(sessionToken)
        if (user)
          return { authenticated: true, userId: user.email }
      }
    }
  }
  catch {
    // fall through to anonymous
  }
  return { authenticated: false, userId: null }
}

/**
 * Authorize an admin-only operation: the shared registry token, or a session
 * belonging to a user with the `admin` role. Member and token management go
 * through here — a publish token must not be able to mint new access.
 */
async function isAdminRequest(req: Request): Promise<boolean> {
  try {
    const authHeader = req.headers.get('authorization')
    const token = extractBearerToken(authHeader)
    if (token) {
      const registryToken = getRegistryToken()
      // Only the shared registry token confers admin; user API tokens do not.
      if (registryToken && token.length === registryToken.length) {
        const maxLen = Math.max(token.length, registryToken.length)
        const a = Buffer.alloc(maxLen)
        const b = Buffer.alloc(maxLen)
        Buffer.from(token).copy(a)
        Buffer.from(registryToken).copy(b)
        if (require('node:crypto').timingSafeEqual(a, b))
          return true
      }
    }

    if (_authService) {
      const sessionToken = extractSessionToken(req)
      if (sessionToken) {
        const user = await _authService.validateSession(sessionToken)
        if (user?.role === 'admin')
          return true
      }
    }
  }
  catch {
    // fall through to unauthorized
  }
  return false
}

/**
 * Refuse anyone but the package's publisher (or the operator).
 *
 * Pricing is not a publish operation: holding a valid publish token says you
 * may upload *your* packages, not that you may put a price on — or remove one
 * from — somebody else's. An unclaimed package (published before publishers
 * were recorded) can be priced by any authenticated account, matching how the
 * publisher dashboard already treats it.
 *
 * Returns a Response when the request must be refused, or null to proceed.
 */
async function requirePackageOwner(
  req: Request,
  registry: Registry,
  packageName: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const identity = await identifyReader(req)
  if (!identity.authenticated) {
    return Response.json(
      { error: 'Authentication required', hint: 'pantry token set --registry <registry-url>' },
      { status: 401, headers: corsHeaders },
    )
  }
  if (identity.userId === '_admin') return null

  const record = await registry.getPublisherPackageRecord(packageName)
  if (!record) {
    return Response.json({ error: 'Package not found' }, { status: 404, headers: corsHeaders })
  }
  if (record.publishedBy && record.publishedBy !== identity.userId) {
    // A team member acts for the seat holder who owns the package.
    if (_authService && await _authService.canActFor(identity.userId, record.publishedBy))
      return null
    return Response.json(
      { error: 'Only the publisher of this package can change its price' },
      { status: 403, headers: corsHeaders },
    )
  }
  return null
}

/**
 * The plan the seller of a package is on, which sets our commission.
 *
 * Resolved at checkout rather than stored on the package: a publisher who
 * subscribes today should pay 5% on tomorrow's sales without having to touch
 * every package they've ever listed. An unclaimed package has no seller, so it
 * falls to Free.
 */
/**
 * Refuse a publish that would overwrite someone else's package.
 *
 * Without this, holding any publish token was enough to ship a new version of
 * *any* package: the registry recorded the first publisher and then never
 * consulted the record again, so a stranger could push `their-package@99.0.0`
 * and that is what everyone would install.
 *
 * Allowed: the account that published it, anyone on that account's team, and
 * the operator. A name nobody has claimed is still first-come.
 *
 * Returns a Response to refuse with, or null to proceed.
 */
async function requirePublishRights(
  registry: Registry,
  userId: string | undefined,
  packageName: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  if (!userId || userId === '_admin') return null

  const record = await registry.getPublisherPackageRecord(packageName).catch(() => null)
  const owner = record?.publishedBy
  if (!owner) return null // unclaimed — first publish wins it

  if (owner === userId) return null
  if (_authService && await _authService.canActFor(userId, owner)) return null

  return Response.json(
    {
      error: `${packageName} belongs to another account`,
      hint: 'Ask its owner to add you to their team, or publish under a name you own',
    },
    { status: 403, headers: corsHeaders },
  )
}

/**
 * The plan whose limits apply when publishing a package: the owner's, so a team
 * member gets the seat holder's headroom rather than their own personal plan.
 */
async function tierForPackage(
  registry: Registry,
  packageName: string,
  fallbackUserId: string | undefined,
): Promise<Tier> {
  const record = await registry.getPublisherPackageRecord(packageName).catch(() => null)
  if (record?.publishedBy) return tierForUser(record.publishedBy)
  return tierForUser(fallbackUserId)
}

/** The plan an account is on, for gating features. Free when unknown. */
async function tierForUser(userId: string | null | undefined): Promise<Tier> {
  if (!userId || userId === '_admin' || !_authService) return 'free'
  try {
    return await _authService.getTier(userId)
  }
  catch {
    return 'free'
  }
}

async function sellerTierFor(
  registry: Registry,
  auth: AuthService | undefined,
  packageName: string,
): Promise<Tier> {
  if (!auth) return 'free'
  try {
    const record = await registry.getPublisherPackageRecord(packageName)
    if (!record?.publishedBy) return 'free'
    return await auth.getTier(record.publishedBy)
  }
  catch {
    // Never fail a sale over a tier lookup — charge the standard rate.
    return 'free'
  }
}

/**
 * Subscriptions: the account's own plan.
 *
 *   GET  /api/plans                — the tier table, public
 *   GET  /account/subscription     — what this account is on
 *   POST /account/subscription     {tier} — start a checkout
 *   POST /account/billing-portal   — manage or cancel in Stripe
 *
 * Session-authenticated, because these are things a person does about their own
 * billing — an API token deliberately can't move someone onto a paid plan.
 */
async function handleSubscriptionRoutes(
  path: string,
  req: Request,
  auth: AuthService,
  baseUrl: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  if (path === '/api/plans' && req.method === 'GET') {
    return Response.json({
      plans: Object.values(TIERS).map(t => ({
        id: t.id,
        name: t.name,
        price: t.price,
        formattedPrice: t.price === 0 ? 'Free' : `$${(t.price / 100).toFixed(0)}/mo`,
        // What a seller pays us per sale. `commission` is kept as an alias so a
        // CLI built before this rename keeps rendering the right number.
        sellingFee: formatBps(t.commissionBps),
        sellingFeeBps: t.commissionBps,
        commission: formatBps(t.commissionBps),
        commissionBps: t.commissionBps,
        privatePackages: t.privatePackages,
        priorityBuilds: t.priorityBuilds,
        analyticsRetentionDays: t.analyticsRetentionDays,
        maxArtifactMB: Math.round(t.maxArtifactBytes / (1024 * 1024)),
        seats: t.seats,
        buildInsurance: t.buildInsurance,
        securityAlerts: t.securityAlerts,
        sbomExport: t.sbomExport,
        teamEntitlements: t.teamEntitlements,
      })),
      discoveryFee: formatBps(DISCOVERY_FEE_BPS),
      discoveryFeeBps: DISCOVERY_FEE_BPS,
      paymentsEnabled: paymentsEnabled(),
    }, { headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=300' } })
  }

  const isTeamPath = path === '/account/team' || path.startsWith('/account/team/')
  if (path !== '/account/subscription' && path !== '/account/billing-portal' && !isTeamPath) return null

  const sessionToken = extractSessionToken(req)
  const user = sessionToken ? await auth.validateSession(sessionToken) : null
  if (!user) {
    return Response.json(
      { error: 'Sign in to manage your plan' },
      { status: 401, headers: corsHeaders },
    )
  }

  const current = await auth.getSubscription(user.email)
  const tier = await auth.getTier(user.email)

  if (path === '/account/subscription' && req.method === 'GET') {
    const def = tierDefinition(tier)
    return Response.json({
      tier,
      name: def.name,
      status: current?.status || 'none',
      sellingFee: formatBps(def.commissionBps),
      commission: formatBps(def.commissionBps),
      currentPeriodEnd: current?.currentPeriodEnd,
      manageable: Boolean(current?.stripeCustomerId),
    }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
  }

  if (path === '/account/subscription' && req.method === 'POST') {
    const body = await req.json().catch(() => null) as { tier?: string } | null
    const requested = tierOf(body?.tier)
    if (requested === 'free') {
      return Response.json(
        { error: 'Cancel from the billing portal rather than downgrading here', hint: 'POST /account/billing-portal' },
        { status: 400, headers: corsHeaders },
      )
    }
    if (tier === requested) {
      return Response.json({ alreadySubscribed: true, tier }, { headers: corsHeaders })
    }

    try {
      const session = await createSubscriptionCheckout({
        tier: tierDefinition(requested),
        email: user.email,
        baseUrl,
        stripeCustomerId: current?.stripeCustomerId,
      })
      return Response.json({ url: session.url }, { headers: corsHeaders })
    }
    catch (err: any) {
      console.error('Subscription checkout error:', err)
      return Response.json({ error: err.message || 'Could not start checkout' }, { status: 400, headers: corsHeaders })
    }
  }

  // -------------------------------------------------------------------------
  // Team seats
  // -------------------------------------------------------------------------

  if (isTeamPath) {
    const def = tierDefinition(tier)

    if (path === '/account/team' && req.method === 'GET') {
      const members = await auth.getTeamMembers(user.email)
      const belongsTo = await auth.getTeamOwner(user.email)
      return Response.json({
        tier,
        seats: def.seats,
        // The seat holder occupies one, so a 10-seat plan invites 9 people.
        seatsUsed: members.length + 1,
        members,
        memberOf: belongsTo,
        canInvite: def.seats > 1,
      }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
    }

    if (path === '/account/team/members' && req.method === 'POST') {
      if (def.seats <= 1) {
        return Response.json({
          error: 'Seats are a Team feature',
          hint: 'pantry subscribe team',
          tier,
        }, { status: 402, headers: corsHeaders })
      }
      const body = await req.json().catch(() => null) as { email?: string } | null
      const invitee = typeof body?.email === 'string' ? body.email.trim() : ''
      if (!invitee) {
        return Response.json({ error: 'An email address is required' }, { status: 400, headers: corsHeaders })
      }
      try {
        const members = await auth.addTeamMember(user.email, invitee, def.seats)
        return Response.json({ members, seats: def.seats, seatsUsed: members.length + 1 }, { headers: corsHeaders })
      }
      catch (err: any) {
        const status = err instanceof AuthError ? err.status : 400
        return Response.json({ error: err.message }, { status, headers: corsHeaders })
      }
    }

    const removeMatch = path.match(/^\/account\/team\/members\/(.+)$/)
    if (removeMatch && req.method === 'DELETE') {
      const target = decodeURIComponent(removeMatch[1])
      const members = await auth.removeTeamMember(user.email, target)
      return Response.json({ members, seats: def.seats, seatsUsed: members.length + 1 }, { headers: corsHeaders })
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })
  }

  if (path === '/account/billing-portal' && req.method === 'POST') {
    if (!current?.stripeCustomerId) {
      return Response.json({ error: 'This account has no billing history' }, { status: 400, headers: corsHeaders })
    }
    try {
      const session = await createBillingPortalSession(current.stripeCustomerId, `${baseUrl}/account`)
      return Response.json({ url: session.url }, { headers: corsHeaders })
    }
    catch (err: any) {
      console.error('Billing portal error:', err)
      return Response.json({ error: err.message || 'Could not open the billing portal' }, { status: 400, headers: corsHeaders })
    }
  }

  return null
}

// ===========================================================================
// Build insurance, alerts and SBOMs
//
// All three answer to one org — the seat holder when the caller is on a team,
// otherwise themselves — so a team shares one mirror, one watch list and one
// inventory rather than each member accumulating their own.
// ===========================================================================

let _mirrorStore: MirrorStore | null = null
let _securityStore: SecurityStore | null = null

function mirrorStore(registry: Registry): MirrorStore {
  if (!_mirrorStore) _mirrorStore = new MirrorStore(registry.tarball)
  return _mirrorStore
}

function securityStore(registry: Registry): SecurityStore {
  if (!_securityStore) _securityStore = new SecurityStore(registry.tarball)
  return _securityStore
}

/** Swap the stores out in tests, so neither S3 nor OSV is touched. */
export function setEnterpriseStores(mirror: MirrorStore | null, security: SecurityStore | null): void {
  _mirrorStore = mirror
  _securityStore = security
}

/** The org a caller acts for: their team's seat holder, or themselves. */
async function orgFor(email: string): Promise<string> {
  if (!_authService) return email
  return (await _authService.getTeamOwner(email)) || email
}

/**
 * Insurance, alerts and SBOMs are what a paid plan buys. Returns the caller's
 * org, or a Response explaining why not.
 */
async function requirePaidOrg(
  req: Request,
  feature: string,
  corsHeaders: Record<string, string>,
  entitled: (t: TierDefinition) => boolean = t => t.buildInsurance,
): Promise<{ org: string, email: string, tier: Tier } | Response> {
  const identity = await identifyReader(req)
  if (!identity.authenticated || !identity.userId || identity.userId === '_admin') {
    return Response.json(
      { error: 'Sign in to use this', hint: 'pantry token set' },
      { status: 401, headers: corsHeaders },
    )
  }

  const org = await orgFor(identity.userId)
  // The org's plan, not the individual's — a team member gets what the seat
  // holder pays for.
  const tier = await tierForUser(org)
  if (!entitled(tierDefinition(tier))) {
    return Response.json(
      {
        error: `${feature} is a paid feature`,
        hint: 'pantry subscribe pro',
        tier,
      },
      { status: 402, headers: corsHeaders },
    )
  }

  return { org, email: identity.userId, tier }
}

/**
 * Routes for the three:
 *
 *   POST /mirror/snapshot            record and store what you installed
 *   GET  /mirror                     what's insured
 *   GET  /mirror/{name}/{version}/tarball   serve the insured copy
 *   PUT  /security/watch             register a lockfile (+ licence policy)
 *   GET  /security/alerts            what's wrong with it now
 *   PUT  /security/policy            set the licence policy alone
 *   GET  /sbom?format=cyclonedx|spdx an SBOM of the inventory
 */
async function handleEnterpriseRoutes(
  path: string,
  req: Request,
  registry: Registry,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  if (!path.startsWith('/mirror') && !path.startsWith('/security') && path !== '/sbom') return null

  // ---- mirror -------------------------------------------------------------

  if (path === '/mirror/snapshot' && req.method === 'POST') {
    const gate = await requirePaidOrg(req, 'Build insurance', corsHeaders)
    if (gate instanceof Response) return gate

    const body = await req.json().catch(() => null) as { entries?: unknown } | null
    const entries = normalizeEntries(body?.entries)
    if (entries.length === 0) {
      return Response.json({ error: 'No usable entries — send {entries: [{name, version, resolved, integrity}]}' }, { status: 400, headers: corsHeaders })
    }

    const result = await mirrorStore(registry).snapshot(gate.org, entries)
    return Response.json({
      org: gate.org,
      mirrored: result.mirrored,
      skipped: result.skipped,
      failed: result.failed,
      // Only the failures are echoed back: a 2,000-package snapshot doesn't
      // need to repeat the whole lockfile to say it worked.
      failures: result.entries.filter(e => e.error).map(e => ({ name: e.name, version: e.version, error: e.error })),
    }, { headers: corsHeaders })
  }

  if (path === '/mirror' && req.method === 'GET') {
    const gate = await requirePaidOrg(req, 'Build insurance', corsHeaders)
    if (gate instanceof Response) return gate

    const store = mirrorStore(registry)
    return Response.json({
      org: gate.org,
      stats: await store.stats(gate.org),
      entries: (await store.list(gate.org)).slice(0, 500),
    }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
  }

  const mirrorTarball = path.match(/^\/mirror\/(.+)\/([^/]+)\/tarball$/)
  if (mirrorTarball && req.method === 'GET') {
    const gate = await requirePaidOrg(req, 'Build insurance', corsHeaders)
    if (gate instanceof Response) return gate

    const found = await mirrorStore(registry).fetchArtifact(
      gate.org,
      decodeURIComponent(mirrorTarball[1]),
      decodeURIComponent(mirrorTarball[2]),
    )
    if (!found) {
      return Response.json({ error: 'Not in your mirror' }, { status: 404, headers: corsHeaders })
    }

    return new Response(found.bytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/gzip',
        'Content-Length': String(found.bytes.byteLength),
        'X-Pantry-Mirrored-At': found.record.mirroredAt,
        ...(found.record.sha256 ? { 'X-Pantry-SHA256': found.record.sha256 } : {}),
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    })
  }

  // ---- security -----------------------------------------------------------

  if (path === '/security/watch' && (req.method === 'PUT' || req.method === 'POST')) {
    const gate = await requirePaidOrg(req, 'Security alerts', corsHeaders, t => t.securityAlerts)
    if (gate instanceof Response) return gate

    const body = await req.json().catch(() => null) as { entries?: unknown, policy?: unknown } | null
    const entries = normalizeEntries(body?.entries)
    if (entries.length === 0) {
      return Response.json({ error: 'No usable entries — send {entries: [{name, version, ecosystem, license}]}' }, { status: 400, headers: corsHeaders })
    }

    const list = await securityStore(registry).setWatchList(gate.org, entries, normalizePolicy(body?.policy))
    return Response.json({ org: gate.org, watched: list.entries.length, policy: list.policy }, { headers: corsHeaders })
  }

  if (path === '/security/policy' && (req.method === 'PUT' || req.method === 'POST')) {
    const gate = await requirePaidOrg(req, 'Security alerts', corsHeaders, t => t.securityAlerts)
    if (gate instanceof Response) return gate

    const policy = normalizePolicy(await req.json().catch(() => null))
    if (!policy) {
      return Response.json({ error: 'Send {allow: [...]} and/or {deny: [...]}' }, { status: 400, headers: corsHeaders })
    }

    const list = await securityStore(registry).setPolicy(gate.org, policy)
    return Response.json({ org: gate.org, policy: list.policy }, { headers: corsHeaders })
  }

  if (path === '/security/alerts' && req.method === 'GET') {
    const gate = await requirePaidOrg(req, 'Security alerts', corsHeaders, t => t.securityAlerts)
    if (gate instanceof Response) return gate

    const report = await securityStore(registry).report(gate.org)
    // 'no-store': a cached all-clear is the one thing this endpoint must never
    // serve.
    return Response.json(report, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
  }

  // ---- SBOM ---------------------------------------------------------------

  if (path === '/sbom' && req.method === 'GET') {
    const gate = await requirePaidOrg(req, 'SBOM export', corsHeaders, t => t.sbomExport)
    if (gate instanceof Response) return gate

    const url = new URL(req.url)
    const format = parseFormat(url.searchParams.get('format'))

    // Prefer the mirror (it has hashes we computed ourselves); fall back to the
    // watch list for orgs that registered a lockfile without insuring it.
    let entries = await mirrorStore(registry).list(gate.org)
    if (entries.length === 0) {
      const watched = await securityStore(registry).getWatchList(gate.org)
      entries = watched.entries.map(e => ({ ...e, mirroredAt: watched.updatedAt }))
    }

    const document = buildSbom(entries, format, {
      org: gate.org,
      subject: url.searchParams.get('name') || undefined,
    })

    return new Response(JSON.stringify(document, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${format === 'spdx' ? 'sbom.spdx.json' : 'sbom.cdx.json'}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  return null
}

/** Resolve paid-package access for a request, including who published it. */
async function resolvePackageAccess(
  req: Request,
  registry: Registry,
  packageName: string,
  version: string,
): Promise<Awaited<ReturnType<typeof resolveAccess>>> {
  const paywall = await registry.metadata.getPaywall(packageName)
  // The common case is a free package: don't pay for identity resolution or a
  // publisher lookup on every download just to find there's nothing to check.
  if (!paywall || !paywall.enabled)
    return { allowed: true, reason: 'no-paywall' }

  const identity = await identifyReader(req)
  const record = await registry.getPublisherPackageRecord(packageName)

  return resolveAccess(
    registry.metadata,
    packageName,
    version,
    {
      userId: identity.userId,
      token: extractBearerToken(req.headers.get('authorization')),
      admin: identity.userId === '_admin',
      org: identity.userId && identity.userId !== '_admin' ? await orgFor(identity.userId) : null,
    },
    record?.publishedBy,
  )
}

/**
 * Member and token administration for a private registry.
 *
 * Open signup is off on a private registry, so an operator needs another way to
 * onboard people and machines. These endpoints are it:
 *
 *   POST /admin/users          {email, name, password, role}  — create a member
 *   POST /admin/tokens         {email, name, permissions[]}   — mint a token
 *   POST /admin/tokens/revoke  {email, id}                    — revoke one
 *
 * Authenticated with the shared registry token (what CI and provisioning
 * scripts have) or an admin session. Returns null when the path isn't ours.
 */
async function handleAdminRoutes(
  path: string,
  req: Request,
  auth: AuthService,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  if (!path.startsWith('/admin/')) return null

  const known = path === '/admin/users' || path === '/admin/tokens' || path === '/admin/tokens/revoke'
  if (!known || req.method !== 'POST') return null

  if (!(await isAdminRequest(req))) {
    return Response.json(
      { error: 'Admin authentication required', hint: 'Send the registry token: Authorization: Bearer $PANTRY_REGISTRY_TOKEN' },
      { status: 401, headers: corsHeaders },
    )
  }

  const body = await req.json().catch(() => null) as Record<string, any> | null
  if (!body)
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })

  const email = typeof body.email === 'string' ? body.email : ''

  try {
    if (path === '/admin/users') {
      const user = await auth.upsertUserAccount(
        email,
        typeof body.name === 'string' ? body.name : '',
        typeof body.password === 'string' ? body.password : '',
        body.role === 'admin' ? 'admin' : 'user',
      )
      return Response.json({ success: true, user }, { status: 201, headers: corsHeaders })
    }

    if (path === '/admin/tokens') {
      const user = await auth.findUser(email)
      if (!user)
        return Response.json({ error: `No such user: ${email}` }, { status: 404, headers: corsHeaders })

      const valid = ['publish', 'read'] as const
      const permissions = Array.isArray(body.permissions)
        ? body.permissions.filter((p: unknown): p is 'publish' | 'read' => valid.includes(p as any))
        : ['read' as const]

      const result = await auth.createApiToken(user.email, typeof body.name === 'string' ? body.name : 'admin-issued', {
        permissions: permissions.length > 0 ? permissions : ['read'],
        expiresInDays: typeof body.expiresInDays === 'number' ? body.expiresInDays : undefined,
      })
      return Response.json({ success: true, ...result }, { status: 201, headers: corsHeaders })
    }

    // /admin/tokens/revoke
    const id = typeof body.id === 'string' ? body.id : ''
    if (!email || !id)
      return Response.json({ error: 'email and id are required' }, { status: 400, headers: corsHeaders })
    await auth.deleteApiToken(email.toLowerCase().trim(), id)
    return Response.json({ success: true }, { headers: corsHeaders })
  }
  catch (err: any) {
    const status = err instanceof AuthError ? err.status : 400
    return Response.json({ error: err.message }, { status, headers: corsHeaders })
  }
}

async function authorizeBinaryPublisher(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const auth = await validateToken(req.headers.get('authorization'))
  if (!auth.valid) {
    return Response.json({ error: auth.error }, { status: 401, headers: corsHeaders })
  }
  if (auth.userId !== '_admin') {
    return Response.json({
      error: 'Native binary publication requires the operator registry token',
      code: 'BINARY_OPERATOR_AUTH_REQUIRED',
    }, { status: 403, headers: corsHeaders })
  }
  return null
}

async function handleBinaryUploadInitiate(
  req: Request,
  getPublisher: () => BinaryArtifactPublisher,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const denied = await authorizeBinaryPublisher(req, corsHeaders)
  if (denied) return denied
  const body = await req.json().catch(() => null)
  if (!body)
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })

  try {
    const initiated = getPublisher().initiate(body)
    return Response.json(initiated, { status: 201, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
  }
  catch (error) {
    if (error instanceof BinaryPublishError)
      return binaryPublishErrorResponse(error, corsHeaders)
    console.error('Binary upload initiation failed:', (error as Error).message)
    return Response.json({
      error: 'Binary publication is not configured',
      code: 'BINARY_PUBLISH_NOT_CONFIGURED',
      retryable: true,
    }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
  }
}

async function handleBinaryUploadComplete(
  req: Request,
  getPublisher: () => BinaryArtifactPublisher,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const denied = await authorizeBinaryPublisher(req, corsHeaders)
  if (denied) return denied
  const body = await req.json().catch(() => null) as { uploadId?: unknown } | null
  if (!body || typeof body.uploadId !== 'string') {
    return Response.json({
      error: 'uploadId is required',
      code: 'BINARY_UPLOAD_ID_REQUIRED',
    }, { status: 400, headers: corsHeaders })
  }

  try {
    const completed = await getPublisher().complete(body.uploadId, '_admin')
    return Response.json({ success: true, ...completed }, {
      status: 201,
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    })
  }
  catch (error) {
    if (error instanceof BinaryPublishError)
      return binaryPublishErrorResponse(error, corsHeaders)
    console.error('Binary upload completion failed:', (error as Error).message)
    return Response.json({
      error: 'Binary publication failed before promotion',
      code: 'BINARY_PUBLISH_FAILED',
      retryable: true,
    }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
  }
}

async function handleBinaryRescan(
  req: Request,
  getPublisher: () => BinaryArtifactPublisher,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const denied = await authorizeBinaryPublisher(req, corsHeaders)
  if (denied) return denied
  if (process.env.NODE_ENV === 'production') {
    return Response.json({
      error: 'Production legacy rescans must use the isolated prepare/attest workflow',
      code: 'BINARY_EXTERNAL_RESCAN_REQUIRED',
      retryable: false,
    }, { status: 409, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
  }
  const body = await req.json().catch(() => null)
  if (!body)
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })

  try {
    const completed = await getPublisher().rescanExisting(body, '_admin')
    invalidateBinaryMetadata(completed.domain)
    if (completed.action === 'quarantined')
      _binaryAttestationCache.delete(completed.tarball)
    return Response.json({ success: true, ...completed }, {
      status: completed.action === 'quarantined' ? 202 : 200,
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    })
  }
  catch (error) {
    if (error instanceof BinaryPublishError)
      return binaryPublishErrorResponse(error, corsHeaders)
    console.error('Binary rescan failed:', (error as Error).message)
    return Response.json({
      error: 'Binary rescan failed before attestation',
      code: 'BINARY_RESCAN_FAILED',
      retryable: true,
    }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
  }
}

async function handleBinaryExternalRescanPrepare(
  req: Request,
  getPublisher: () => BinaryArtifactPublisher,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const denied = await authorizeBinaryPublisher(req, corsHeaders)
  if (denied) return denied
  const body = await req.json().catch(() => null)
  if (!body)
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })

  try {
    return Response.json(await getPublisher().prepareExternalRescan(body), {
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    })
  }
  catch (error) {
    if (error instanceof BinaryPublishError)
      return binaryPublishErrorResponse(error, corsHeaders)
    console.error('Binary external rescan preparation failed:', (error as Error).message)
    return Response.json({
      error: 'Binary external rescan preparation failed',
      code: 'BINARY_RESCAN_PREPARE_FAILED',
      retryable: true,
    }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
  }
}

async function handleBinaryExternalRescanAttest(
  req: Request,
  getPublisher: () => BinaryArtifactPublisher,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const denied = await authorizeBinaryPublisher(req, corsHeaders)
  if (denied) return denied
  const body = await req.json().catch(() => null)
  if (!body)
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })

  try {
    const completed = await getPublisher().attestExternalRescan(body, '_admin-external-scanner')
    invalidateBinaryMetadata(completed.domain)
    if (completed.action === 'quarantined')
      _binaryAttestationCache.delete(completed.tarball)
    return Response.json({ success: true, ...completed }, {
      status: completed.action === 'quarantined' ? 202 : 200,
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    })
  }
  catch (error) {
    if (error instanceof BinaryPublishError)
      return binaryPublishErrorResponse(error, corsHeaders)
    console.error('Binary external rescan attestation failed:', (error as Error).message)
    return Response.json({
      error: 'Binary external rescan attestation failed',
      code: 'BINARY_RESCAN_ATTEST_FAILED',
      retryable: true,
    }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
  }
}

async function handleBinaryQuarantineReviewPrepare(
  req: Request,
  getPublisher: () => BinaryArtifactPublisher,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const denied = await authorizeBinaryPublisher(req, corsHeaders)
  if (denied) return denied
  const body = await req.json().catch(() => null)
  if (!body)
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })

  try {
    return Response.json(await getPublisher().prepareExternalQuarantineReview(body), {
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    })
  }
  catch (error) {
    if (error instanceof BinaryPublishError)
      return binaryPublishErrorResponse(error, corsHeaders)
    console.error('Binary quarantine review preparation failed:', (error as Error).message)
    return Response.json({
      error: 'Binary quarantine review preparation failed',
      code: 'BINARY_QUARANTINE_REVIEW_PREPARE_FAILED',
      retryable: true,
    }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
  }
}

async function handleBinaryQuarantineReviewAttest(
  req: Request,
  getPublisher: () => BinaryArtifactPublisher,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const denied = await authorizeBinaryPublisher(req, corsHeaders)
  if (denied) return denied
  const body = await req.json().catch(() => null)
  if (!body)
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })

  try {
    const completed = await getPublisher().attestExternalQuarantineReview(body, '_admin-quarantine-review')
    invalidateBinaryMetadata(completed.domain)
    for (const record of Object.values(completed.platforms))
      _binaryAttestationCache.delete(record.tarball)
    return Response.json({ success: true, ...completed }, {
      status: completed.action === 'still-quarantined' ? 202 : 200,
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    })
  }
  catch (error) {
    if (error instanceof BinaryPublishError)
      return binaryPublishErrorResponse(error, corsHeaders)
    console.error('Binary quarantine review attestation failed:', (error as Error).message)
    return Response.json({
      error: 'Binary quarantine review attestation failed',
      code: 'BINARY_QUARANTINE_REVIEW_ATTEST_FAILED',
      retryable: true,
    }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
  }
}

/**
 * Handle package publish
 */
async function handlePublish(
  req: Request,
  registry: Registry,
  corsHeaders: Record<string, string>,
  malwareScanner: MalwareScanner,
): Promise<Response> {
  const contentType = req.headers.get('content-type') || ''

  // Validate token (supports both legacy admin token and user API tokens)
  const authHeader = req.headers.get('authorization')
  const authResult = await validateToken(authHeader)
  if (!authResult.valid) {
    return Response.json(
      { error: authResult.error },
      { status: 401, headers: corsHeaders },
    )
  }

  // Handle multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const metadataStr = formData.get('metadata')
    const tarballFile = formData.get('tarball')

    if (!metadataStr || typeof metadataStr !== 'string') {
      return Response.json(
        { error: 'Missing metadata' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!tarballFile || !(tarballFile instanceof File)) {
      return Response.json(
        { error: 'Missing tarball' },
        { status: 400, headers: corsHeaders },
      )
    }

    let metadata: any
    try {
      metadata = JSON.parse(metadataStr)
    }
    catch {
      return Response.json(
        { error: 'Invalid metadata JSON' },
        { status: 400, headers: corsHeaders },
      )
    }
    const nameErr = validatePublishName(metadata.name)
    if (nameErr) return Response.json({ error: nameErr }, { status: 400, headers: corsHeaders })
    const versionErr = validatePublishVersion(metadata.version)
    if (versionErr) return Response.json({ error: versionErr }, { status: 400, headers: corsHeaders })
    const metaErr = validateMetadataLimits(metadata)
    if (metaErr) return Response.json({ error: metaErr }, { status: 400, headers: corsHeaders })

    // You may only publish to a name you own, or one your team owns.
    const notYours = await requirePublishRights(registry, authResult.userId, metadata.name, corsHeaders)
    if (notYours) return notYours

    // Artifact size is what the plan buys: 50MB on Free, 250MB on Pro, 1GB on
    // Team. Checked against the declared size before the body is buffered, so
    // an over-limit upload is refused rather than read into memory first. The
    // owner's plan applies, so a team member gets the seat holder's headroom.
    const publisherTier = await tierForPackage(registry, metadata.name, authResult.userId)
    const maxBytes = tierDefinition(publisherTier).maxArtifactBytes
    if (tarballFile.size > maxBytes) {
      const mb = (bytes: number): string => `${Math.round(bytes / (1024 * 1024))}MB`
      return Response.json(
        {
          error: `Tarball is ${mb(tarballFile.size)}, over the ${mb(maxBytes)} limit for the ${tierDefinition(publisherTier).name} plan`,
          ...(publisherTier === 'free'
            ? { hint: 'Pro raises this to 250MB, Team to 1GB: pantry subscribe pro' }
            : {}),
        },
        { status: 413, headers: corsHeaders },
      )
    }

    // Fail fast on duplicate publishes *before* buffering the tarball — saves
    // 50 MB of wasted memory/IO when a CI job retries a published version.
    const exists = await registry.exists(metadata.name, metadata.version)
    if (exists) {
      return Response.json(
        { error: 'Version already exists' },
        { status: 409, headers: corsHeaders },
      )
    }

    const tarball = await tarballFile.arrayBuffer()

    const publisherId = authResult.userId && authResult.userId !== '_admin' ? authResult.userId : undefined
    const security = await validateAndScanCorePackage(
      metadata,
      tarball,
      registry,
      malwareScanner,
      authResult.userId,
      corsHeaders,
    )
    if (security instanceof Response) return security
    metadata.malwareScan = security
    await registry.publish(metadata, tarball, publisherId)

    return Response.json(
      {
        success: true,
        message: `Published ${metadata.name}@${metadata.version}`,
        scan: publicScanResult(security),
      },
      { status: 201, headers: corsHeaders },
    )
  }

  // Handle JSON with base64 tarball (alternative)
  if (contentType.includes('application/json')) {
    let body: { metadata?: any, tarball?: string }
    try {
      body = await req.json() as typeof body
    }
    catch {
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers: corsHeaders },
      )
    }
    const { metadata, tarball: tarballBase64 } = body

    if (!metadata || !tarballBase64) {
      return Response.json(
        { error: 'Missing metadata or tarball' },
        { status: 400, headers: corsHeaders },
      )
    }

    const jsonNameErr = validatePublishName(metadata.name)
    if (jsonNameErr) return Response.json({ error: jsonNameErr }, { status: 400, headers: corsHeaders })
    const jsonVersionErr = validatePublishVersion(metadata.version)
    if (jsonVersionErr) return Response.json({ error: jsonVersionErr }, { status: 400, headers: corsHeaders })
    const notYoursJson = await requirePublishRights(registry, authResult.userId, metadata.name, corsHeaders)
    if (notYoursJson) return notYoursJson

    const jsonMetaErr = validateMetadataLimits(metadata)
    if (jsonMetaErr) return Response.json({ error: jsonMetaErr }, { status: 400, headers: corsHeaders })

    // Fail fast before decoding potentially large base64 payload.
    const exists = await registry.exists(metadata.name, metadata.version)
    if (exists) {
      return Response.json(
        { error: 'Version already exists' },
        { status: 409, headers: corsHeaders },
      )
    }

    let tarball: ArrayBuffer
    try {
      tarball = Uint8Array.from(atob(tarballBase64), c => c.charCodeAt(0)).buffer
    }
    catch {
      return Response.json(
        { error: 'Invalid base64 tarball data' },
        { status: 400, headers: corsHeaders },
      )
    }

    const publisherIdJson = authResult.userId && authResult.userId !== '_admin' ? authResult.userId : undefined
    const security = await validateAndScanCorePackage(
      metadata,
      tarball,
      registry,
      malwareScanner,
      authResult.userId,
      corsHeaders,
    )
    if (security instanceof Response) return security
    metadata.malwareScan = security
    await registry.publish(metadata, tarball, publisherIdJson)

    return Response.json(
      {
        success: true,
        message: `Published ${metadata.name}@${metadata.version}`,
        scan: publicScanResult(security),
      },
      { status: 201, headers: corsHeaders },
    )
  }

  return Response.json(
    { error: 'Unsupported content type' },
    { status: 415, headers: corsHeaders },
  )
}

async function validateAndScanCorePackage(
  metadata: any,
  tarball: ArrayBuffer,
  registry: Registry,
  malwareScanner: MalwareScanner,
  publisher: string | undefined,
  corsHeaders: Record<string, string>,
) {
  const existing = await registry.getPublisherPackageRecord(metadata.name)
  const previouslyDeclared = Object.values(existing?.versions || {})
    .some(version => version.contentPolicy !== undefined)

  try {
    const dualUse = validateDualUsePackage(metadata.contentPolicy, tarball, previouslyDeclared)
    if (dualUse) {
      // Pantry account/API tokens do not currently carry 2FA/OIDC assurance.
      // Until they do, dual-use releases require the operator-reviewed legacy
      // credential rather than pretending an ordinary bearer token is strong.
      if (publisher !== '_admin') {
        return Response.json({
          error: 'Dual-use packages require an operator-reviewed publish because Pantry API tokens do not yet carry 2FA assurance',
          code: 'DUAL_USE_STRONG_AUTH_REQUIRED',
        }, { status: 403, headers: corsHeaders })
      }
      metadata.contentPolicy = dualUse.contentPolicy
      metadata.disclosure = dualUse.disclosure
    }
  }
  catch (error) {
    if (error instanceof DualUsePolicyError) {
      return Response.json({
        error: error.message,
        code: 'DUAL_USE_POLICY_INVALID',
      }, { status: 422, headers: corsHeaders })
    }
    throw error
  }

  const result = await scanPackageArtifact(malwareScanner, tarball, {
    surface: 'package',
    name: metadata.name,
    version: metadata.version,
    publisher,
  })
  if (result.verdict !== 'clean')
    return malwareScanFailureResponse(result, corsHeaders)
  return result
}

/**
 * Handle POST /publish/commit — publish packages from a git commit
 * Accepts multipart/form-data with:
 *   - packages[]: tarball files
 *   - metadata: JSON string with { sha, repository, packages: [{ name, packageDir, version }] }
 * Or JSON body with:
 *   - sha: commit hash
 *   - repository: repo URL
 *   - packages: [{ name, tarball (base64), packageDir?, version? }]
 */
const MAX_COMMIT_TARBALL_SIZE = 50 * 1024 * 1024 // 50MB per tarball

async function handleCommitPublish(
  req: Request,
  registry: Registry,
  baseUrl: string,
  corsHeaders: Record<string, string>,
  malwareScanner: MalwareScanner,
): Promise<Response> {
  const contentType = req.headers.get('content-type') || ''

  // Validate token (supports both legacy admin token and user API tokens)
  const authHeader = req.headers.get('authorization')
  const authResult = await validateToken(authHeader)
  if (!authResult.valid) {
    return Response.json(
      { error: authResult.error },
      { status: 401, headers: corsHeaders },
    )
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const metadataStr = formData.get('metadata')

    if (!metadataStr || typeof metadataStr !== 'string') {
      return Response.json(
        { error: 'Missing metadata' },
        { status: 400, headers: corsHeaders },
      )
    }

    let metadata: {
      sha: string
      repository?: string
      packages: Array<{ name: string, packageDir?: string, version?: string }>
    }
    try {
      metadata = JSON.parse(metadataStr)
    }
    catch {
      return Response.json(
        { error: 'Invalid metadata JSON' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!metadata.sha || !metadata.packages?.length) {
      return Response.json(
        { error: 'Missing sha or packages in metadata' },
        { status: 400, headers: corsHeaders },
      )
    }

    const results: Array<{ name: string, url: string, sha: string, scan: ReturnType<typeof publicScanResult> }> = []
    const publisherId = authResult.userId && authResult.userId !== '_admin' ? authResult.userId : undefined
    const prepared: Array<{
      pkg: { name: string, packageDir?: string, version?: string }
      tarball: ArrayBuffer
      scan: Awaited<ReturnType<typeof scanPackageArtifact>>
    }> = []

    for (const pkg of metadata.packages) {
      const tarballFile = formData.get(`package:${pkg.name}`)
      if (!tarballFile || !(tarballFile instanceof File)) {
        continue
      }

      if (tarballFile.size > MAX_COMMIT_TARBALL_SIZE) {
        return Response.json(
          { error: `Tarball for ${pkg.name} exceeds maximum size of 50MB` },
          { status: 413, headers: corsHeaders },
        )
      }

      const tarball = await tarballFile.arrayBuffer()
      const scan = await scanPackageArtifact(malwareScanner, tarball, {
        surface: 'commit',
        name: pkg.name,
        version: pkg.version,
        commit: metadata.sha,
        publisher: authResult.userId,
      })
      if (scan.verdict !== 'clean')
        return malwareScanFailureResponse(scan, corsHeaders)
      prepared.push({ pkg, tarball, scan })
    }

    // Scan the whole batch before the first write. One blocked/unavailable
    // member leaves every member unpublished.
    for (const { pkg, tarball, scan } of prepared) {
      await registry.publishCommit(pkg.name, metadata.sha, tarball, {
        repository: metadata.repository,
        packageDir: pkg.packageDir,
        version: pkg.version,
        publishedBy: publisherId,
        malwareScan: scan,
      })

      results.push({
        name: pkg.name,
        url: `${baseUrl}/commits/${metadata.sha}/${encodeURIComponent(pkg.name)}/tarball`,
        sha: metadata.sha,
        scan: publicScanResult(scan),
      })
    }

    return Response.json(
      {
        success: true,
        sha: metadata.sha,
        packages: results,
        message: `Published ${results.length} package(s) from commit ${metadata.sha.slice(0, 7)}`,
      },
      { status: 201, headers: corsHeaders },
    )
  }

  if (contentType.includes('application/json')) {
    let body: {
      sha: string
      repository?: string
      packages: Array<{ name: string, tarball: string, packageDir?: string, version?: string }>
    }
    try {
      body = await req.json() as typeof body
    }
    catch {
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!body.sha || !body.packages?.length) {
      return Response.json(
        { error: 'Missing sha or packages' },
        { status: 400, headers: corsHeaders },
      )
    }

    const results: Array<{ name: string, url: string, sha: string, scan: ReturnType<typeof publicScanResult> }> = []
    const publisherIdJson = authResult.userId && authResult.userId !== '_admin' ? authResult.userId : undefined
    const prepared: Array<{
      pkg: { name: string, tarball: string, packageDir?: string, version?: string }
      tarball: ArrayBuffer
      scan: Awaited<ReturnType<typeof scanPackageArtifact>>
    }> = []

    for (const pkg of body.packages) {
      let tarball: ArrayBuffer
      try {
        tarball = Uint8Array.from(atob(pkg.tarball), c => c.charCodeAt(0)).buffer
      }
      catch {
        return Response.json(
          { error: `Invalid base64 tarball data for ${pkg.name}` },
          { status: 400, headers: corsHeaders },
        )
      }

      if (tarball.byteLength > MAX_COMMIT_TARBALL_SIZE) {
        return Response.json(
          { error: `Tarball for ${pkg.name} exceeds maximum size of 50MB` },
          { status: 413, headers: corsHeaders },
        )
      }

      const scan = await scanPackageArtifact(malwareScanner, tarball, {
        surface: 'commit',
        name: pkg.name,
        version: pkg.version,
        commit: body.sha,
        publisher: authResult.userId,
      })
      if (scan.verdict !== 'clean')
        return malwareScanFailureResponse(scan, corsHeaders)
      prepared.push({ pkg, tarball, scan })
    }

    for (const { pkg, tarball, scan } of prepared) {
      await registry.publishCommit(pkg.name, body.sha, tarball, {
        repository: body.repository,
        packageDir: pkg.packageDir,
        version: pkg.version,
        publishedBy: publisherIdJson,
        malwareScan: scan,
      })

      results.push({
        name: pkg.name,
        url: `${baseUrl}/commits/${body.sha}/${encodeURIComponent(pkg.name)}/tarball`,
        sha: body.sha,
        scan: publicScanResult(scan),
      })
    }

    return Response.json(
      {
        success: true,
        sha: body.sha,
        packages: results,
        message: `Published ${results.length} package(s) from commit ${body.sha.slice(0, 7)}`,
      },
      { status: 201, headers: corsHeaders },
    )
  }

  return Response.json(
    { error: 'Unsupported content type' },
    { status: 415, headers: corsHeaders },
  )
}

// ---------------------------------------------------------------------------
// Authentication route handlers
// ---------------------------------------------------------------------------

/** Extract session token from cookie OR Authorization header */
function extractSessionToken(req: Request): string | null {
  // Check Authorization header first (works through CDN/CloudFront)
  const authHeader = req.headers.get('authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    // Session tokens are 64-char hex strings; skip API tokens (ptry_ prefix)
    if (token.length === 64 && /^[a-f0-9]+$/i.test(token)) {
      return token
    }
  }
  // Fall back to cookie
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(/pantry_session=([^;]+)/)
  return match ? match[1] : null
}

/**
 * Handle auth API routes (/auth/*)
 */
/**
 * Why a signup must be refused, or null when it may proceed.
 *
 * A private registry with open signup isn't private, so signups default off
 * there (`REGISTRY_ALLOW_SIGNUP=true` re-opens them, usually alongside
 * `REGISTRY_SIGNUP_DOMAINS=yourcompany.com` for self-serve onboarding).
 */
/**
 * A post-login redirect target we're willing to honour: same-origin, absolute
 * path only. `//evil.example` and `https://evil.example` are paths a browser
 * would happily follow off-site, so they're rejected.
 */
function safeRedirectTarget(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(value)) return null
  return value
}

function signupRejection(email: string): string | null {
  if (!signupsEnabled())
    return 'Signups are closed on this registry — ask an operator for an account'
  if (!isSignupEmailAllowed(email))
    return 'That email domain is not allowed to sign up on this registry'
  return null
}

async function handleAuthRoutes(
  path: string,
  req: Request,
  auth: AuthService,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  // POST /auth/signup — create a new account
  if (path === '/auth/signup' && req.method === 'POST') {
    try {
      const body = await req.json() as { email?: string, name?: string, password?: string }
      const rejection = signupRejection(body.email || '')
      if (rejection)
        return Response.json({ error: rejection }, { status: 403, headers: corsHeaders })
      await auth.signup(body.email || '', body.name || '', body.password || '')
      const { sessionToken, user: loggedInUser } = await auth.login(body.email || '', body.password || '')

      return new Response(JSON.stringify({ success: true, user: loggedInUser, sessionToken }), {
        status: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `pantry_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
        },
      })
    }
    catch (err: any) {
      const status = err instanceof AuthError ? err.status : 400
      return Response.json({ error: err.message }, { status, headers: corsHeaders })
    }
  }

  // POST /auth/login — authenticate and create session
  if (path === '/auth/login' && req.method === 'POST') {
    try {
      const body = await req.json() as { email?: string, password?: string }
      const { sessionToken, user } = await auth.login(body.email || '', body.password || '')

      return new Response(JSON.stringify({ success: true, user, sessionToken }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `pantry_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
        },
      })
    }
    catch (err: any) {
      const status = err instanceof AuthError ? err.status : 401
      return Response.json({ error: err.message }, { status, headers: corsHeaders })
    }
  }

  // POST /auth/logout — destroy session
  if (path === '/auth/logout' && req.method === 'POST') {
    const sessionToken = extractSessionToken(req)
    if (sessionToken) {
      await auth.logout(sessionToken)
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Set-Cookie': 'pantry_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    })
  }

  // GET /auth/me — get current user info
  if (path === '/auth/me' && req.method === 'GET') {
    const sessionToken = extractSessionToken(req)
    if (!sessionToken) {
      return Response.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders })
    }
    const user = await auth.validateSession(sessionToken)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': 'pantry_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        },
      })
    }
    return Response.json({ user }, { headers: corsHeaders })
  }

  // GET /auth/tokens — list API tokens for the current user
  if (path === '/auth/tokens' && req.method === 'GET') {
    const sessionToken = extractSessionToken(req)
    if (!sessionToken) {
      return Response.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders })
    }
    const user = await auth.validateSession(sessionToken)
    if (!user) {
      return Response.json({ error: 'Session expired' }, { status: 401, headers: corsHeaders })
    }
    const tokens = await auth.listApiTokens(user.email)
    return Response.json({ tokens }, { headers: corsHeaders })
  }

  // POST /auth/tokens — create a new API token
  if (path === '/auth/tokens' && req.method === 'POST') {
    const sessionToken = extractSessionToken(req)
    if (!sessionToken) {
      return Response.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders })
    }
    const user = await auth.validateSession(sessionToken)
    if (!user) {
      return Response.json({ error: 'Session expired' }, { status: 401, headers: corsHeaders })
    }

    try {
      const body = await req.json() as { name?: string, permissions?: ('publish' | 'read')[], expiresInDays?: number }
      const validPermissions = ['publish', 'read'] as const
      const permissions = Array.isArray(body.permissions)
        ? body.permissions.filter((p): p is 'publish' | 'read' => validPermissions.includes(p as any))
        : undefined
      const result = await auth.createApiToken(user.email, body.name || '', {
        permissions,
        expiresInDays: body.expiresInDays,
      })
      return Response.json({ success: true, ...result }, { status: 201, headers: corsHeaders })
    }
    catch (err: any) {
      const status = err instanceof AuthError ? err.status : 400
      return Response.json({ error: err.message }, { status, headers: corsHeaders })
    }
  }

  // DELETE /auth/tokens/{id} — revoke an API token
  const tokenDeleteMatch = path.match(/^\/auth\/tokens\/(.+)$/)
  if (tokenDeleteMatch && req.method === 'DELETE') {
    const sessionToken = extractSessionToken(req)
    if (!sessionToken) {
      return Response.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders })
    }
    const user = await auth.validateSession(sessionToken)
    if (!user) {
      return Response.json({ error: 'Session expired' }, { status: 401, headers: corsHeaders })
    }

    const tokenId = decodeURIComponent(tokenDeleteMatch[1])
    await auth.deleteApiToken(user.email, tokenId)
    return Response.json({ success: true }, { headers: corsHeaders })
  }

  return null
}

/**
 * Handle site auth pages (/login, /signup, /account)
 * These serve HTML pages and handle form submissions.
 */
async function handleSiteAuth(
  path: string,
  req: Request,
  auth: AuthService,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const htmlHeaders = {
    ...corsHeaders,
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  }

  const next = safeRedirectTarget(new URL(req.url).searchParams.get('next')) || '/account'
  const pageContext = { next, encodedNext: encodeURIComponent(next) }

  // Login page
  if (path === '/login') {
    if (req.method === 'POST') {
      let formData: Awaited<ReturnType<typeof req.formData>> | undefined
      try {
        formData = await req.formData()
        pageContext.next = safeRedirectTarget(formData.get('next') as string) || next
        pageContext.encodedNext = encodeURIComponent(pageContext.next)
        const email = formData.get('email') as string || ''
        const password = formData.get('password') as string || ''
        const { sessionToken } = await auth.login(email, password)
        // The private-registry gate bounces browsers here with ?next=… — send
        // them back where they were headed instead of dumping them on /account.
        const destination = safeRedirectTarget(formData.get('next') as string || new URL(req.url).searchParams.get('next'))
        return new Response(null, {
          status: 302,
          headers: {
            ...htmlHeaders,
            'Location': destination || '/account',
            'Set-Cookie': `pantry_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
          },
        })
      }
      catch {
        // Generic error message to prevent user enumeration via timing/messaging differences
        const html = await renderSitePage('login.stx', { ...pageContext, error: 'Invalid email or password', title: 'Log In', email: formData?.get('email') || '' })
        return new Response(html, { status: 401, headers: htmlHeaders })
      }
    }
    // Check if already logged in
    const sessionToken = extractSessionToken(req)
    if (sessionToken) {
      const user = await auth.validateSession(sessionToken)
      if (user) {
        return new Response(null, { status: 302, headers: { ...htmlHeaders, Location: next } })
      }
    }
    const html = await renderSitePage('login.stx', { ...pageContext, title: 'Log In' })
    return new Response(html, { headers: htmlHeaders })
  }

  // Signup page
  if (path === '/signup') {
    // Closed signups: don't render a form that can only fail. Send people to
    // the login page, where an operator-provisioned account works.
    if (!signupsEnabled()) {
      return new Response(null, { status: 302, headers: { ...htmlHeaders, Location: '/login' } })
    }
    if (req.method === 'POST') {
      let formData: Awaited<ReturnType<typeof req.formData>> | undefined
      try {
        formData = await req.formData()
        pageContext.next = safeRedirectTarget(formData.get('next') as string) || next
        pageContext.encodedNext = encodeURIComponent(pageContext.next)
        const email = formData.get('email') as string || ''
        const name = formData.get('name') as string || ''
        const password = formData.get('password') as string || ''
        const rejection = signupRejection(email)
        if (rejection) {
          const html = await renderSitePage('signup.stx', { ...pageContext, error: rejection, title: 'Sign Up', email, name })
          return new Response(html, { status: 403, headers: htmlHeaders })
        }
        await auth.signup(email, name, password)
        const { sessionToken } = await auth.login(email, password)
        return new Response(null, {
          status: 302,
          headers: {
            ...htmlHeaders,
            'Location': safeRedirectTarget(formData.get('next') as string) || next,
            'Set-Cookie': `pantry_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
          },
        })
      }
      catch (err: any) {
        const html = await renderSitePage('signup.stx', { ...pageContext, error: err.message || 'Signup failed', title: 'Sign Up', email: formData?.get('email') || '', name: formData?.get('name') || '' })
        return new Response(html, { status: err instanceof AuthError ? err.status : 400, headers: htmlHeaders })
      }
    }
    // Check if already logged in
    const sessionToken = extractSessionToken(req)
    if (sessionToken) {
      const user = await auth.validateSession(sessionToken)
      if (user) {
        return new Response(null, { status: 302, headers: { ...htmlHeaders, Location: next } })
      }
    }
    const html = await renderSitePage('signup.stx', { ...pageContext, title: 'Sign Up' })
    return new Response(html, { headers: htmlHeaders })
  }

  // Account page (token management)
  if (path === '/account') {
    const sessionToken = extractSessionToken(req)
    if (!sessionToken) {
      return new Response(null, { status: 302, headers: { ...htmlHeaders, Location: '/login' } })
    }
    const user = await auth.validateSession(sessionToken)
    if (!user) {
      return new Response(null, {
        status: 302,
        headers: {
          ...htmlHeaders,
          'Location': '/login',
          'Set-Cookie': 'pantry_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        },
      })
    }
    const tokens = await auth.listApiTokens(user.email)
    const html = await renderSitePage('account.stx', {
      title: 'Account',
      user,
      tokens,
    })
    return new Response(html, { headers: htmlHeaders })
  }

  return htmlResponse(await renderSitePage('404.stx', { title: 'Not Found' }), 404)
}

// ---------------------------------------------------------------------------
// Publisher dashboard (session-authenticated)
// ---------------------------------------------------------------------------

type SessionUser = { email: string, name: string, role?: 'admin' | 'user' }

async function requireSessionUser(
  req: Request,
  auth: AuthService,
): Promise<SessionUser | Response> {
  const sessionToken = extractSessionToken(req)
  if (!sessionToken) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }
  const user = await auth.validateSession(sessionToken)
  if (!user) {
    return Response.json({ error: 'Invalid or expired session' }, { status: 401 })
  }
  return user
}

function isSiteAdmin(user: SessionUser): boolean {
  return user.role === 'admin'
}

async function canManagePackage(pkg: { publishedBy?: string } | null, user: SessionUser): Promise<boolean> {
  if (!pkg) return false
  if (isSiteAdmin(user)) return true
  if (!pkg.publishedBy) return true
  if (pkg.publishedBy === user.email) return true
  // Team members manage the seat holder's packages as if they were their own.
  return _authService ? _authService.canActFor(user.email, pkg.publishedBy) : false
}

async function handlePublisherApi(
  path: string,
  req: Request,
  registry: Registry,
  analyticsStorage: AnalyticsStorage,
  auth: AuthService,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  if (!path.startsWith('/publisher/api/')) return null

  const userResult = await requireSessionUser(req, auth)
  if (userResult instanceof Response) {
    const errBody = await userResult.text()
    return new Response(errBody, {
      status: userResult.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const user = userResult
  const admin = isSiteAdmin(user)

  if (path === '/publisher/api/packages' && req.method === 'GET') {
    const packages = await registry.listPublisherPackages(user.email, admin ? 200 : 50, admin)
    return Response.json({ packages, admin }, { headers: corsHeaders })
  }

  // Pricing from the publisher dashboard. Matched before the generic package
  // route below, whose `(.+)` would otherwise swallow the `/paywall` suffix
  // into the package name.
  const paywallMatch = path.match(/^\/publisher\/api\/packages\/(.+)\/paywall$/)
  if (paywallMatch) {
    const name = decodeURIComponent(paywallMatch[1])
    const record = await registry.getPublisherPackageRecord(name)
    if (!record || !(await canManagePackage(record, user))) {
      return Response.json({ error: 'Package not found or access denied' }, { status: 403, headers: corsHeaders })
    }

    if (req.method === 'GET') {
      const paywall = await registry.metadata.getPaywall(name)
      return Response.json({
        paywall: paywall && paywall.enabled
          ? {
              enabled: true,
              price: paywall.price,
              currency: paywall.currency,
              formattedPrice: formatPrice(paywall.price, paywall.currency),
              freeVersions: paywall.freeVersions || [],
              payoutAccountId: paywall.stripeAccountId,
            }
          : { enabled: false },
        paymentsEnabled: paymentsEnabled(),
      }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } })
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      let body: PriceConfig
      try {
        body = await req.json() as PriceConfig
      }
      catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders })
      }
      const invalid = validatePriceConfig(body)
      if (invalid) return Response.json({ error: invalid }, { status: 400, headers: corsHeaders })

      // Claim the package on first price, the same way editing its metadata does.
      if (!record.publishedBy && !admin) {
        await registry.claimPublisherPackage(name, user.email)
      }

      try {
        const paywall = await configurePaywall(registry.metadata, name, body)
        return Response.json({
          paywall: {
            enabled: paywall.enabled,
            price: paywall.price,
            currency: paywall.currency,
            formattedPrice: formatPrice(paywall.price, paywall.currency),
            freeVersions: paywall.freeVersions || [],
            payoutAccountId: paywall.stripeAccountId,
          },
          paymentsEnabled: paymentsEnabled(),
        }, { headers: corsHeaders })
      }
      catch (err: any) {
        return Response.json({ error: err.message || 'Could not set the price' }, { status: 400, headers: corsHeaders })
      }
    }

    if (req.method === 'DELETE') {
      await registry.metadata.deletePaywall(name)
      return Response.json({ paywall: { enabled: false } }, { headers: corsHeaders })
    }
  }

  const pkgMatch = path.match(/^\/publisher\/api\/packages\/(.+)$/)
  if (pkgMatch) {
    const name = decodeURIComponent(pkgMatch[1])

    if (req.method === 'GET') {
      const record = await registry.getPublisherPackageRecord(name)
      if (!record || !(await canManagePackage(record, user))) {
        return Response.json({ error: 'Package not found or access denied' }, { status: 403, headers: corsHeaders })
      }
      const stats = await analyticsStorage.getPackageStats(name)
      const commits = await registry.getPackageCommits(name, 15)
      // Free accounts see the last 30 days; paid plans get the whole history.
      // The data is kept either way — this is what the plan buys, not a reason
      // to throw away someone's numbers.
      const tier = await auth.getTier(user.email)
      const retentionDays = tierDefinition(tier).analyticsRetentionDays
      const timeline = await analyticsStorage.getDownloadTimeline(name, retentionDays)
      return Response.json({
        package: record,
        stats: {
          totalDownloads: stats?.totalDownloads ?? record.totalDownloads,
          downloads30d: stats?.monthlyDownloads ?? 0,
          weeklyDownloads: stats?.weeklyDownloads ?? 0,
        },
        timeline,
        analytics: { tier, retentionDays, truncated: retentionDays < 3650 },
        commits,
      }, { headers: corsHeaders })
    }

    if (req.method === 'PATCH') {
      const record = await registry.getPublisherPackageRecord(name)
      if (!record || !(await canManagePackage(record, user))) {
        return Response.json({ error: 'Package not found or access denied' }, { status: 403, headers: corsHeaders })
      }
      let body: {
        description?: string
        homepage?: string
        repository?: string
        license?: string
        settings?: Record<string, unknown>
      }
      try {
        body = await req.json() as typeof body
      }
      catch {
        return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders })
      }
      if (!record.publishedBy && !admin) {
        await registry.claimPublisherPackage(name, user.email)
      }

      // Hiding a package from search is a paid feature. Refuse the change
      // rather than silently saving a setting that wouldn't be honoured.
      const settings = body.settings as Record<string, unknown> | undefined
      if (settings?.visibility === 'unlisted' && !admin) {
        const tier = await auth.getTier(user.email)
        if (!tierDefinition(tier).privatePackages) {
          return Response.json({
            error: 'Unlisted packages are a Pro feature',
            hint: 'Subscribe at /pricing, or with: pantry subscribe pro',
            tier,
          }, { status: 402, headers: corsHeaders })
        }
      }

      // The storage layer keeps a strict single-owner check as its own line of
      // defence. A team member has already been authorized above, so the write
      // is made *as* the seat holder rather than by loosening that invariant.
      const actingAs = record.publishedBy && record.publishedBy !== user.email
        && _authService && await _authService.canActFor(user.email, record.publishedBy)
        ? record.publishedBy
        : user.email

      const updated = await registry.updatePublisherPackage(name, actingAs, {
        description: body.description,
        homepage: body.homepage,
        repository: body.repository,
        license: body.license,
        settings: body.settings as any,
      }, admin)
      return Response.json({ package: updated }, { headers: corsHeaders })
    }
  }

  return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })
}

async function handlePublisherSite(
  path: string,
  req: Request,
  auth: AuthService,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  if (path === '/publisher' || path.startsWith('/publisher/package/')) {
    const sessionToken = extractSessionToken(req)
    if (!sessionToken) {
      return new Response(null, {
        status: 302,
        headers: { Location: `/login?next=${encodeURIComponent(path)}`, ...corsHeaders },
      })
    }
    const user = await auth.validateSession(sessionToken)
    if (!user) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login', ...corsHeaders },
      })
    }

    if (path === '/publisher') {
      const html = await renderSitePage('publisher/index.stx', {
        title: 'Publisher',
        metaDescription: 'Manage your published packages on pantry.dev',
        canonicalUrl: 'https://pantry.dev/publisher',
      })
      return htmlResponse(html)
    }

    const pkgMatch = path.match(/^\/publisher\/package\/(.+)$/)
    if (pkgMatch) {
      const html = await renderSitePage('publisher/package.stx', {
        title: 'Package settings',
        canonicalUrl: `https://pantry.dev/publisher/package/${encodeURIComponent(decodeURIComponent(pkgMatch[1]))}`,
      })
      return htmlResponse(html)
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// npm bulk dependency resolution
// ---------------------------------------------------------------------------

/** Cache of npm registry metadata (package name -> abbreviated metadata) */
const NPM_METADATA_TTL = 30 * 60 * 1000 // 30 minutes — npm packages change infrequently
const npmMetadataCache = new BoundedTtlCache<string, any>(500, NPM_METADATA_TTL)

/** Cache of full resolution results (input hash -> resolved tree) */
const NPM_RESOLUTION_TTL = 15 * 60 * 1000 // 15 minutes
const npmResolutionCache = new BoundedTtlCache<string, any>(200, NPM_RESOLUTION_TTL)

async function fetchNpmMetadata(name: string): Promise<any> {
  const cached = npmMetadataCache.get(name)
  if (cached !== undefined) return cached
  // Scoped packages: @scope/name -> @scope%2fname in URL
  const encodedName = name.startsWith('@') ? `@${encodeURIComponent(name.slice(1))}` : encodeURIComponent(name)
  const res = await fetch(`https://registry.npmjs.org/${encodedName}`, {
    headers: { 'Accept': 'application/vnd.npm.install-v1+json' },
  })
  if (!res.ok) {
    throw new Error(`npm registry returned ${res.status} for ${name}`)
  }
  const data = await res.json()
  npmMetadataCache.set(name, data)
  return data
}

/**
 * Parse a semver version string into [major, minor, patch] numbers.
 * Returns null for unparseable strings.
 */
function parseSemver(v: string): [number, number, number] | null {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** Compare two semver tuples. Returns <0, 0, or >0. */
function compareSemver(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

function semverGte(v: [number, number, number], target: [number, number, number]): boolean {
  return compareSemver(v, target) >= 0
}

function semverLt(v: [number, number, number], target: [number, number, number]): boolean {
  return compareSemver(v, target) < 0
}

/**
 * Check if version satisfies a single constraint like >=1.2.3, <2.0.0, etc.
 */
function satisfiesSingle(version: [number, number, number], constraint: string): boolean {
  const c = constraint.trim()
  if (!c || c === '*' || c === 'latest') return true

  const geMatch = c.match(/^>=\s*(\d+\.\d+\.\d+)/)
  if (geMatch) {
    const target = parseSemver(geMatch[1])
    return target ? semverGte(version, target) : false
  }

  const gtMatch = c.match(/^>\s*(\d+\.\d+\.\d+)/)
  if (gtMatch) {
    const target = parseSemver(gtMatch[1])
    return target ? compareSemver(version, target) > 0 : false
  }

  const leMatch = c.match(/^<=\s*(\d+\.\d+\.\d+)/)
  if (leMatch) {
    const target = parseSemver(leMatch[1])
    return target ? compareSemver(version, target) <= 0 : false
  }

  const ltMatch = c.match(/^<\s*(\d+\.\d+\.\d+)/)
  if (ltMatch) {
    const target = parseSemver(ltMatch[1])
    return target ? semverLt(version, target) : false
  }

  const eqMatch = c.match(/^=?\s*(\d+\.\d+\.\d+)/)
  if (eqMatch) {
    const target = parseSemver(eqMatch[1])
    return target ? compareSemver(version, target) === 0 : false
  }

  return false
}

/**
 * Resolve the best version that satisfies a constraint from a list of available versions.
 * Supports: ^, ~, >=, >, <=, <, exact, *, latest, x-ranges, || (or), space-separated (and).
 */
function resolveVersion(constraint: string, versions: string[], distTags?: Record<string, string>): string | null {
  const c = constraint.trim()

  // Handle 'latest', '*', or empty
  if (!c || c === '*' || c === 'latest' || c === '') {
    return distTags?.latest || versions[versions.length - 1] || null
  }

  // Handle dist-tag references (e.g. "next", "canary")
  if (distTags && distTags[c]) {
    return distTags[c]
  }

  // Handle npm: alias — npm:actual-package@version
  if (c.startsWith('npm:')) {
    // The caller handles alias resolution; this shouldn't normally reach here
    return null
  }

  // Handle || (or) ranges: at least one sub-range must match
  if (c.includes('||')) {
    const subRanges = c.split('||')
    let best: [number, number, number] | null = null
    let bestStr: string | null = null
    for (const sub of subRanges) {
      const resolved = resolveVersion(sub.trim(), versions, distTags)
      if (resolved) {
        const parsed = parseSemver(resolved)
        if (parsed && (!best || compareSemver(parsed, best) > 0)) {
          best = parsed
          bestStr = resolved
        }
      }
    }
    return bestStr
  }

  // Handle caret: ^major.minor.patch
  const caretMatch = c.match(/^\^(\d+)(?:\.(\d+))?(?:\.(\d+))?/)
  if (caretMatch) {
    const major = Number(caretMatch[1])
    const minor = caretMatch[2] !== undefined ? Number(caretMatch[2]) : 0
    const patch = caretMatch[3] !== undefined ? Number(caretMatch[3]) : 0
    const floor: [number, number, number] = [major, minor, patch]
    let ceiling: [number, number, number]
    if (major !== 0) {
      ceiling = [major + 1, 0, 0]
    }
else if (minor !== 0) {
      ceiling = [0, minor + 1, 0]
    }
else {
      ceiling = [0, 0, patch + 1]
    }
    return findBest(versions, floor, ceiling)
  }

  // Handle tilde: ~major.minor.patch
  const tildeMatch = c.match(/^~(\d+)(?:\.(\d+))?(?:\.(\d+))?/)
  if (tildeMatch) {
    const major = Number(tildeMatch[1])
    const minor = tildeMatch[2] !== undefined ? Number(tildeMatch[2]) : 0
    const patch = tildeMatch[3] !== undefined ? Number(tildeMatch[3]) : 0
    const floor: [number, number, number] = [major, minor, patch]
    const ceiling: [number, number, number] = [major, minor + 1, 0]
    return findBest(versions, floor, ceiling)
  }

  // Handle x-ranges: 1.x, 1.2.x, 1.x.x
  const xRangeMatch = c.match(/^(\d+)(?:\.(x|\*|\d+))?(?:\.(x|\*|\d+))?$/)
  if (xRangeMatch && (c.includes('x') || c.includes('*') || !c.includes('.'))) {
    const major = Number(xRangeMatch[1])
    if (!xRangeMatch[2] || xRangeMatch[2] === 'x' || xRangeMatch[2] === '*') {
      return findBest(versions, [major, 0, 0], [major + 1, 0, 0])
    }
    const minor = Number(xRangeMatch[2])
    if (!xRangeMatch[3] || xRangeMatch[3] === 'x' || xRangeMatch[3] === '*') {
      return findBest(versions, [major, minor, 0], [major, minor + 1, 0])
    }
  }

  // Handle space-separated AND ranges: >=1.0.0 <2.0.0
  // Split on spaces but keep operators attached to their versions
  const parts = c.match(/(>=?|<=?|=)?\s*\d+\.\d+\.\d+/g)
  if (parts && parts.length > 1) {
    let best: string | null = null
    let bestParsed: [number, number, number] | null = null
    for (const v of versions) {
      const parsed = parseSemver(v)
      if (!parsed) continue
      // Skip pre-release versions
      if (v.includes('-')) continue
      let allMatch = true
      for (const part of parts) {
        if (!satisfiesSingle(parsed, part.trim())) {
          allMatch = false
          break
        }
      }
      if (allMatch && (!bestParsed || compareSemver(parsed, bestParsed) > 0)) {
        best = v
        bestParsed = parsed
      }
    }
    return best
  }

  // Handle exact version
  const exactMatch = c.match(/^=?\s*(\d+\.\d+\.\d+)/)
  if (exactMatch) {
    const target = exactMatch[1]
    return versions.includes(target) ? target : null
  }

  // Handle single constraint (>=, >, <=, <)
  if (c.startsWith('>') || c.startsWith('<')) {
    let best: string | null = null
    let bestParsed: [number, number, number] | null = null
    for (const v of versions) {
      const parsed = parseSemver(v)
      if (!parsed || v.includes('-')) continue
      if (satisfiesSingle(parsed, c) && (!bestParsed || compareSemver(parsed, bestParsed) > 0)) {
        best = v
        bestParsed = parsed
      }
    }
    return best
  }

  return null
}

/** Find highest version in [floor, ceiling) */
function findBest(versions: string[], floor: [number, number, number], ceiling: [number, number, number]): string | null {
  let best: string | null = null
  let bestParsed: [number, number, number] | null = null
  for (const v of versions) {
    const parsed = parseSemver(v)
    if (!parsed) continue
    // Skip pre-release versions unless explicitly requested
    if (v.includes('-')) continue
    if (semverGte(parsed, floor) && semverLt(parsed, ceiling)) {
      if (!bestParsed || compareSemver(parsed, bestParsed) > 0) {
        best = v
        bestParsed = parsed
      }
    }
  }
  return best
}

interface ResolvedPackage {
  version: string
  tarball: string
  integrity: string
  dependencies?: Record<string, string>
}

interface RegistryDownloadPackage {
  name: string
  version: string
  tarball: string
  integrity?: string
}

interface RegistryDownloadManifestEntry extends RegistryDownloadPackage {
  file: string
  size: number
}

const REGISTRY_DOWNLOAD_MAX_PACKAGES = 2000
const REGISTRY_DOWNLOAD_FETCH_CONCURRENCY = 8
const TAR_BLOCK_SIZE = 512

function writeTarString(header: Uint8Array, offset: number, length: number, value: string): void {
  const bytes = new TextEncoder().encode(value)
  header.set(bytes.slice(0, length), offset)
}

function writeTarOctal(header: Uint8Array, offset: number, length: number, value: number): void {
  const octal = Math.floor(value).toString(8).padStart(length - 1, '0')
  writeTarString(header, offset, length, `${octal.slice(-(length - 1))}\0`)
}

function createTarHeader(name: string, size: number, typeflag = '0'): Uint8Array {
  if (name.length > 100) {
    throw new Error(`tar entry name too long: ${name}`)
  }

  const header = new Uint8Array(TAR_BLOCK_SIZE)
  writeTarString(header, 0, 100, name)
  writeTarOctal(header, 100, 8, 0o644)
  writeTarOctal(header, 108, 8, 0)
  writeTarOctal(header, 116, 8, 0)
  writeTarOctal(header, 124, 12, size)
  writeTarOctal(header, 136, 12, Math.floor(Date.now() / 1000))
  header.fill(0x20, 148, 156)
  writeTarString(header, 156, 1, typeflag)
  writeTarString(header, 257, 6, 'ustar\0')
  writeTarString(header, 263, 2, '00')

  let checksum = 0
  for (const byte of header) checksum += byte
  const checksumOctal = checksum.toString(8).padStart(6, '0')
  writeTarString(header, 148, 8, `${checksumOctal}\0 `)
  return header
}

function tarPadding(size: number): Uint8Array | undefined {
  const pad = (TAR_BLOCK_SIZE - (size % TAR_BLOCK_SIZE)) % TAR_BLOCK_SIZE
  return pad > 0 ? new Uint8Array(pad) : undefined
}

/** Hostname of the configured object-storage bucket's public base URL (cached). */
let _storageBucketHost: string | undefined
function storageBucketHost(): string {
  if (_storageBucketHost === undefined) {
    const bucket = process.env.S3_BUCKET || 'pantry-registry'
    try {
      _storageBucketHost = new URL(resolveStorageProvider().publicBaseUrl(bucket)).hostname
    }
    catch {
      _storageBucketHost = ''
    }
  }
  return _storageBucketHost
}

function isAllowedBulkTarballUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false

    if (url.hostname === 'registry.npmjs.org' || url.hostname.endsWith('.npmjs.org')) {
      return true
    }

    if (url.hostname === 'registry.pantry.dev') {
      return url.pathname.startsWith('/binaries/')
        || /^\/packages\/[^/]+\/[^/]+\/tarball$/.test(url.pathname)
        || /^\/commits\/[^/]+\/[^/]+\/tarball$/.test(url.pathname)
    }

    // Object-storage bucket hosts: legacy AWS S3 plus the currently-configured
    // provider (e.g. Hetzner `pantry-registry.fsn1.your-objectstorage.com`).
    if (url.hostname === 'pantry-registry.s3.amazonaws.com'
      || url.hostname === 'pantry-registry.s3.us-east-1.amazonaws.com'
      || url.hostname === storageBucketHost()) {
      return url.pathname.startsWith('/binaries/')
        || url.pathname.startsWith('/packages/')
        || url.pathname.startsWith('/commits/')
    }

    return false
  }
  catch {
    return false
  }
}

function internalBulkTarballUrl(value: string, internalBaseUrl: string): string {
  const url = new URL(value)
  if (url.hostname !== 'registry.pantry.dev')
    return value

  return new URL(`${url.pathname}${url.search}`, `${internalBaseUrl.replace(/\/$/, '')}/`).href
}

async function fetchRegistryTarballBytes(pkg: RegistryDownloadPackage, internalBaseUrl: string): Promise<Uint8Array | null> {
  if (!isAllowedBulkTarballUrl(pkg.tarball)) {
    return null
  }

  // Never send the registry's own tarballs back through its public rpx route.
  // A bulk request can contain hundreds of self-hosted binaries; proxying each
  // one registry -> rpx -> registry recursively exhausts the gateway's
  // connection pool and wedges every Pantry install. Loop back directly to the
  // Bun listener while preserving the public URL in the response manifest.
  const res = await fetch(internalBulkTarballUrl(pkg.tarball, internalBaseUrl), {
    headers: { 'Accept': 'application/octet-stream' },
  })
  if (!res.ok) return null
  return new Uint8Array(await res.arrayBuffer())
}

function normalizeRegistryDownloadPackage(value: unknown): RegistryDownloadPackage | null {
  if (!value || typeof value !== 'object') return null
  const obj = value as Record<string, unknown>
  if (typeof obj.name !== 'string' || typeof obj.version !== 'string' || typeof obj.tarball !== 'string') return null
  if (!obj.name || !obj.version || !obj.tarball) return null
  if (obj.name.includes('..') || obj.version.includes('..') || /[\x00-\x1f]/.test(obj.name + obj.version)) return null
  if (!isAllowedBulkTarballUrl(obj.tarball)) return null
  return {
    name: obj.name,
    version: obj.version,
    tarball: obj.tarball,
    integrity: typeof obj.integrity === 'string' ? obj.integrity : '',
  }
}

function appendTarEntry(controller: ReadableStreamDefaultController<Uint8Array>, name: string, data: Uint8Array): void {
  controller.enqueue(createTarHeader(name, data.byteLength))
  controller.enqueue(data)
  const padding = tarPadding(data.byteLength)
  if (padding) controller.enqueue(padding)
}

async function handleRegistryDownload(req: Request, corsHeaders: Record<string, string>, internalBaseUrl: string): Promise<Response> {
  try {
    const body = await req.json() as { packages?: unknown[] }
    if (!Array.isArray(body?.packages) || body.packages.length === 0) {
      return Response.json(
        { error: 'Missing or empty "packages" array in request body' },
        { status: 400, headers: corsHeaders },
      )
    }
    if (body.packages.length > REGISTRY_DOWNLOAD_MAX_PACKAGES) {
      return Response.json(
        { error: `Too many packages requested; max is ${REGISTRY_DOWNLOAD_MAX_PACKAGES}` },
        { status: 413, headers: corsHeaders },
      )
    }

    const packages = body.packages
      .map(normalizeRegistryDownloadPackage)
      .filter((pkg): pkg is RegistryDownloadPackage => pkg !== null)

    if (packages.length === 0) {
      return Response.json(
        { error: 'No valid registry tarballs requested' },
        { status: 400, headers: corsHeaders },
      )
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const manifest: RegistryDownloadManifestEntry[] = []

        try {
          for (let i = 0; i < packages.length; i += REGISTRY_DOWNLOAD_FETCH_CONCURRENCY) {
            const batch = packages.slice(i, i + REGISTRY_DOWNLOAD_FETCH_CONCURRENCY)
            const fetched = await Promise.all(batch.map(async (pkg, batchIndex) => ({
              pkg,
              index: i + batchIndex,
              bytes: await fetchRegistryTarballBytes(pkg, internalBaseUrl),
            })))

            for (const item of fetched) {
              if (!item.bytes || item.bytes.byteLength === 0) continue
              const file = `packages/${item.index}.tgz`
              appendTarEntry(controller, file, item.bytes)
              manifest.push({
                name: item.pkg.name,
                version: item.pkg.version,
                tarball: item.pkg.tarball,
                integrity: item.pkg.integrity || '',
                file,
                size: item.bytes.byteLength,
              })
            }
          }

          const manifestBytes = new TextEncoder().encode(JSON.stringify({ packages: manifest }))
          appendTarEntry(controller, 'manifest.json', manifestBytes)
          controller.enqueue(new Uint8Array(TAR_BLOCK_SIZE * 2))
          controller.close()
        }
        catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/x-tar',
        'Cache-Control': 'no-store',
        'X-Pantry-Bulk-Download': '1',
      },
    })
  }
  catch (error) {
    console.error('registry bulk download error:', error)
    return Response.json(
      { error: 'Failed to create registry download stream' },
      { status: 500, headers: corsHeaders },
    )
  }
}

/**
 * Resolve all transitive npm dependencies via BFS.
 */
async function resolveNpmDeps(
  inputDeps: Record<string, string>,
): Promise<Record<string, ResolvedPackage>> {
  const resolved = new Map<string, ResolvedPackage>()
  const visiting = new Set<string>() // circular dep guard

  // Queue items: [packageName, versionConstraint]
  const queue: Array<[string, string]> = []
  for (const [name, constraint] of Object.entries(inputDeps)) {
    queue.push([name, constraint])
  }

  while (queue.length > 0) {
    // Process in batches of 50 for better throughput
    const batch = queue.splice(0, 50)
    const toFetch: Array<[string, string]> = []

    for (const [name, constraint] of batch) {
      // Handle npm aliases: "npm:actual-package@^1.0.0"
      let actualName = name
      let actualConstraint = constraint
      if (constraint.startsWith('npm:')) {
        const aliasMatch = constraint.match(/^npm:(@?[^@]+)@(.+)$/)
        if (aliasMatch) {
          actualName = aliasMatch[1]
          actualConstraint = aliasMatch[2]
        }
      }

      // Skip if already resolved or being visited (circular)
      if (resolved.has(actualName) || visiting.has(actualName)) continue

      // Skip URL/git/file dependencies
      if (actualConstraint.startsWith('http') || actualConstraint.startsWith('git') || actualConstraint.startsWith('file:')) continue

      visiting.add(actualName)
      toFetch.push([actualName, actualConstraint])
    }

    if (toFetch.length === 0) continue

    // Fetch metadata concurrently
    const results = await Promise.allSettled(
      toFetch.map(async ([name, constraint]) => {
        const metadata = await fetchNpmMetadata(name)
        return { name, constraint, metadata }
      }),
    )

    for (const result of results) {
      if (result.status === 'rejected') continue
      const { name, constraint, metadata } = result.value

      const allVersions = Object.keys(metadata.versions || {})
      const bestVersion = resolveVersion(constraint, allVersions, metadata['dist-tags'])

      if (!bestVersion || !metadata.versions[bestVersion]) {
        visiting.delete(name)
        continue
      }

      const versionData = metadata.versions[bestVersion]
      const dist = versionData.dist || {}

      const entry: ResolvedPackage = {
        version: bestVersion,
        tarball: dist.tarball || `https://registry.npmjs.org/${name}/-/${name.split('/').pop()}-${bestVersion}.tgz`,
        integrity: dist.integrity || dist.shasum || '',
      }

      // Collect runtime + peer deps (skip dev deps for transitive)
      const deps: Record<string, string> = {
        ...(versionData.dependencies || {}),
        ...(versionData.peerDependencies || {}),
      }

      // Remove optional peer deps
      const peerMeta = versionData.peerDependenciesMeta || {}
      for (const [peerName, meta] of Object.entries(peerMeta)) {
        if ((meta as any)?.optional) {
          delete deps[peerName]
        }
      }

      if (Object.keys(deps).length > 0) {
        entry.dependencies = deps
        // Add transitive deps to queue
        for (const [depName, depConstraint] of Object.entries(deps)) {
          if (!resolved.has(depName) && !visiting.has(depName)) {
            queue.push([depName, depConstraint])
          }
        }
      }

      resolved.set(name, entry)
      visiting.delete(name)
    }
  }

  // Convert to plain object
  const result: Record<string, ResolvedPackage> = {}
  for (const [name, entry] of resolved) {
    result[name] = entry
  }
  return result
}

function hashDeps(deps: Record<string, string>): string {
  const sorted = Object.entries(deps).sort(([a], [b]) => a.localeCompare(b))
  // Use a simple string hash
  const str = JSON.stringify(sorted)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash.toString(36)
}

async function handleNpmResolve(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body = await req.json() as { dependencies?: Record<string, string> }
    const deps = body?.dependencies
    if (!deps || typeof deps !== 'object' || Object.keys(deps).length === 0) {
      return Response.json(
        { error: 'Missing or empty "dependencies" object in request body' },
        { status: 400, headers: corsHeaders },
      )
    }

    // Check resolution cache
    const cacheKey = hashDeps(deps)
    const cached = npmResolutionCache.get(cacheKey)
    if (cached !== undefined) {
      return Response.json(cached, {
        headers: { ...corsHeaders, 'X-Cache': 'HIT' },
      })
    }

    const resolved = await resolveNpmDeps(deps)
    const responseData = { resolved }

    // Cache the result
    npmResolutionCache.set(cacheKey, responseData)

    return Response.json(responseData, {
      headers: { ...corsHeaders, 'X-Cache': 'MISS' },
    })
  }
  catch (error) {
    console.error('npm resolve error:', error)
    return Response.json(
      { error: 'Failed to resolve npm dependencies' },
      { status: 500, headers: corsHeaders },
    )
  }
}

async function handleNpmResolveGet(path: string, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // /npm/resolve/react@^16,react-dom@^16
    const specStr = decodeURIComponent(path.replace('/npm/resolve/', ''))
    if (!specStr) {
      return Response.json(
        { error: 'No package specs provided. Use /npm/resolve/name@constraint,name2@constraint2' },
        { status: 400, headers: corsHeaders },
      )
    }

    const deps: Record<string, string> = {}
    for (const spec of specStr.split(',')) {
      const trimmed = spec.trim()
      if (!trimmed) continue

      // Handle scoped packages: @scope/name@^1.0.0
      let name: string
      let constraint: string
      if (trimmed.startsWith('@')) {
        // Scoped: find the second @ for the version
        const secondAt = trimmed.indexOf('@', 1)
        if (secondAt === -1) {
          name = trimmed
          constraint = 'latest'
        }
else {
          name = trimmed.slice(0, secondAt)
          constraint = trimmed.slice(secondAt + 1)
        }
      }
else {
        const atIdx = trimmed.indexOf('@')
        if (atIdx === -1) {
          name = trimmed
          constraint = 'latest'
        }
else {
          name = trimmed.slice(0, atIdx)
          constraint = trimmed.slice(atIdx + 1)
        }
      }
      deps[name] = constraint || 'latest'
    }

    if (Object.keys(deps).length === 0) {
      return Response.json(
        { error: 'No valid package specs found' },
        { status: 400, headers: corsHeaders },
      )
    }

    // Check resolution cache
    const cacheKey = hashDeps(deps)
    const cached = npmResolutionCache.get(cacheKey)
    if (cached !== undefined) {
      return Response.json(cached, {
        headers: { ...corsHeaders, 'X-Cache': 'HIT' },
      })
    }

    const resolved = await resolveNpmDeps(deps)
    const responseData = { resolved }

    npmResolutionCache.set(cacheKey, responseData)

    return Response.json(responseData, {
      headers: { ...corsHeaders, 'X-Cache': 'MISS' },
    })
  }
  catch (error) {
    console.error('npm resolve GET error:', error)
    return Response.json(
      { error: 'Failed to resolve npm dependencies' },
      { status: 500, headers: corsHeaders },
    )
  }
}

/**
 * Handle binary proxy requests — stream tarballs/metadata/checksums from S3
 */
let _defaultBinaryStorage: BinaryStorage | undefined
/** Cached client used to presign tarball download URLs for private (non-AWS) buckets. */
let _presignClient: ReturnType<typeof createS3Client> | undefined
/** Per-client download budget, built lazily so env changes in tests take effect. */
let _binaryRateLimiter: ReturnType<typeof binaryRateLimiterFromEnv> | undefined
/** Day-bucketed record of bytes handed out. See {@link EgressLedger}. */
let _egressLedger: EgressLedger | undefined
let _egressSnapshotStore: ObjectSnapshot | undefined
/**
 * Set once the stored ledger has been read back successfully.
 *
 * Writing before that would serialize an empty in-memory ledger over a stored
 * month — the load is asynchronous, so a shutdown (or a download) arriving
 * first would otherwise destroy exactly the history being protected.
 */
let _egressPersistReady = false

/**
 * The egress ledger, persisted to the bucket when one is configured.
 *
 * Persistence matters more here than for most counters: the figure it answers
 * questions about is a *monthly* one, so a restart that lost it would reset the
 * month-to-date total and hide exactly the overrun it exists to catch.
 */
export function getEgressLedger(): EgressLedger {
  if (_egressLedger)
    return _egressLedger
  const ledger = new EgressLedger()
  _egressLedger = ledger
  const bucket = process.env.S3_BUCKET
  if (bucket && bucket !== 'local') {
    const store = new ObjectSnapshot(
      createS3Client(resolveStorageProvider()),
      bucket,
      'analytics/registry-egress.json',
      () => ledger.toJSON(),
    )
    _egressSnapshotStore = store
    store.load()
      .then((state) => {
        if (state)
          ledger.load(state)
        // Enabled only after the load resolves, so neither a save from an early
        // download nor a shutdown flush can overwrite the stored month.
        _egressPersistReady = true
        ledger.persistWith(() => store.scheduleSave())
      })
      .catch(err => console.warn('Egress ledger load failed:', (err as Error).message))
  }
  return ledger
}

/**
 * Write the egress ledger out now, rather than on its next throttled tick.
 *
 * Counts are held in memory for up to a minute to avoid a billable object write
 * per download. A deploy restarts this process several times a week, so without
 * an explicit flush the month-to-date figure quietly loses a slice on every
 * one — small each time, systematically low over a month, and always
 * understating the number the whole ledger exists to watch.
 */
export async function flushEgressLedger(): Promise<void> {
  if (!_egressSnapshotStore || !_egressPersistReady)
    return
  await _egressSnapshotStore.flush()
}
const _binaryAttestationCache = new BoundedTtlCache<string, string | false>(50_000, 5 * 60_000)
/**
 * Per-domain `binaries/<domain>/metadata.json`, memoized for the download path.
 *
 * Every tarball AND every checksum request resolved its record by re-reading
 * the whole manifest out of object storage, so a single `pantry install` pulled
 * the same document three times (CLI metadata fetch, tarball, .sha256). These
 * manifests are large — ziglang.org's is >100 KB — and the bucket bills egress
 * per byte, so the repeat reads were a pure multiplier on our storage bill.
 *
 * The TTL is short and every publish path invalidates the domain explicitly, so
 * a freshly published version is still visible immediately.
 */
const _binaryMetadataCache = new BoundedTtlCache<string, any>(2_000, 60_000)

/** Drop the cached manifest for a domain — call after any write to it. */
export function invalidateBinaryMetadata(domain: string): void {
  _binaryMetadataCache.delete(domain)
}

/**
 * How long a presigned binary download URL stays valid, and how coarsely its
 * signing instant is rounded.
 *
 * Two things were wrong with signing each download afresh for an hour. The
 * signature covers `X-Amz-Date`, so every request produced a different URL and
 * nothing between us and the client could ever reuse a response — each install
 * of the same immutable tarball billed the bucket for the full transfer again.
 * And the 302 carried `max-age=86400, immutable` while its Location died after
 * 3600s, so a redirect cached for the advertised day pointed at a signature
 * that had already expired; the client got a 403 and retried, which is exactly
 * the "artifact download failed with HTTP 403" our own scanner kept hitting.
 *
 * Signing from a rounded-down window boundary makes every client inside that
 * window receive a byte-identical URL a shared cache can serve, and deriving
 * the redirect's max-age from the signature's *remaining* life means a cached
 * redirect can never outlive the URL it carries.
 */
const BINARY_PRESIGN_TTL_SECONDS = 24 * 60 * 60
const BINARY_PRESIGN_WINDOW_SECONDS = 60 * 60
/** Safety margin so a redirect served at the very edge of its max-age still resolves. */
const BINARY_PRESIGN_SAFETY_SECONDS = 5 * 60

export function presignBinaryDownload(
  client: { generatePresignedGetUrl: (bucket: string, key: string, expiresInSeconds?: number, signedAt?: Date) => string },
  bucket: string,
  key: string,
  now: number = Date.now(),
): { url: string, maxAgeSeconds: number } {
  const windowMs = BINARY_PRESIGN_WINDOW_SECONDS * 1000
  const signedAtMs = Math.floor(now / windowMs) * windowMs
  const elapsedSeconds = Math.floor((now - signedAtMs) / 1000)
  const maxAgeSeconds = Math.max(
    0,
    BINARY_PRESIGN_TTL_SECONDS - elapsedSeconds - BINARY_PRESIGN_SAFETY_SECONDS,
  )
  return {
    url: client.generatePresignedGetUrl(bucket, key, BINARY_PRESIGN_TTL_SECONDS, new Date(signedAtMs)),
    maxAgeSeconds,
  }
}

/** Read `binaries/<domain>/metadata.json`, serving from the memo when allowed. */
export async function loadBinaryMetadata(store: BinaryStorage, domain: string, cacheable: boolean): Promise<any> {
  if (cacheable) {
    const hit = _binaryMetadataCache.get(domain)
    if (hit !== undefined)
      return hit
  }
  const metadata = JSON.parse((await store.getObject(`binaries/${domain}/metadata.json`)).toString('utf8'))
  if (cacheable)
    _binaryMetadataCache.set(domain, metadata)
  return metadata
}

function binaryAttestationRequired(): boolean {
  const configured = process.env.PANTRY_REQUIRE_BINARY_SCAN_ATTESTATION
  if (configured !== undefined)
    return ['1', 'true', 'yes', 'on'].includes(configured.trim().toLowerCase())
  return process.env.NODE_ENV === 'production'
}

async function hasCleanBinaryAttestation(
  client: ReturnType<typeof createS3Client>,
  bucket: string,
  tarballKey: string,
  expectedSha256: string,
): Promise<boolean> {
  const cached = _binaryAttestationCache.get(tarballKey)
  if (cached !== undefined) return cached === expectedSha256
  let content: Buffer
  try {
    content = await client.getObjectBuffer(bucket, binaryAttestationKey(tarballKey))
  }
  catch (error) {
    // A failed storage request is not evidence that an artifact is unscanned.
    // Leave it uncached so the next request can recover as soon as storage does.
    if (!isS3ObjectNotFound(error)) throw error
    _binaryAttestationCache.set(tarballKey, false)
    return false
  }
  let artifactSha256: string | false = false
  try {
    const parsed = JSON.parse(content.toString('utf8')) as { scan?: { verdict?: unknown, artifactSha256?: unknown } }
    if (
      parsed.scan?.verdict === 'clean'
      && typeof parsed.scan.artifactSha256 === 'string'
      && /^[a-f0-9]{64}$/.test(parsed.scan.artifactSha256)
    )
      artifactSha256 = parsed.scan.artifactSha256
  }
  catch {}
  _binaryAttestationCache.set(tarballKey, artifactSha256)
  return artifactSha256 === expectedSha256
}

// Split a binaries/ key into its parts. The domain itself may contain slashes
// (e.g. crates.io/ripgrep), so peel the fixed trailing segments off the end.
function parseBinaryKey(key: string): { domain: string, version: string, platform: string } | null {
  const parts = key.split('/')
  if (parts.length < 5 || parts[0] !== 'binaries')
    return null
  parts.pop() // file
  const platform = parts.pop()!
  const version = parts.pop()!
  parts.shift() // 'binaries'
  const domain = parts.join('/')
  if (!domain || !version || !platform)
    return null
  return { domain, version, platform }
}

/**
 * Every spelling a version may be indexed under, original first.
 *
 * Build metadata is written `+<hash>` upstream and `_<hash>` wherever a `+` is
 * inconvenient, and the registry accumulated both for the same build — 52 of
 * ziglang.org's 74 versions carry a twin. Anything that compares a version out
 * of a request path against a version out of the manifest has to treat the two
 * as the same build, or the comparison silently answers about the wrong one.
 */
function binaryVersionSpellings(version: string): string[] {
  return [...new Set([version, version.replace(/_/g, '+'), version.replace(/\+/g, '_')])]
}

function storedBinaryObjectKey(value: string): string {
  try {
    return decodeURIComponent(new URL(value).pathname.replace(/^\/+/, ''))
  }
  catch {
    try {
      return decodeURIComponent(value.replace(/^\/+/, ''))
    }
    catch {
      return ''
    }
  }
}

interface ActiveBinaryRecord {
  tarball: string
  sha256: string
  /** Declared artifact size — what the bucket will serve, and what we bill against. */
  size?: number
  malwareScan?: {
    verdict?: unknown
    artifactSha256?: unknown
  }
}

async function findActiveBinaryRecord(
  store: BinaryStorage,
  s3Key: string,
  kind: 'tarball' | 'checksum',
  cacheable = false,
): Promise<ActiveBinaryRecord | null> {
  const parsed = parseBinaryKey(s3Key)
  if (!parsed)
    return null
  let metadata: any
  try {
    metadata = await loadBinaryMetadata(store, parsed.domain, cacheable)
  }
  catch (error) {
    if (!isS3ObjectNotFound(error)) throw error
    return null
  }
  // Match the quarantine on any spelling of the version. Comparing the request's
  // spelling to the manifest's verbatim let a build quarantined as `1282+hash`
  // be served to a client that asked for `1282_hash`.
  const spellings = binaryVersionSpellings(parsed.version)
  if (metadata?.malwareQuarantines?.some((item: any) =>
    spellings.includes(item?.version)
    && Array.isArray(item.platforms)
    && item.platforms.includes(parsed.platform),
  ))
    return null
  const record = metadata?.versions?.[parsed.version]?.platforms?.[parsed.platform] as ActiveBinaryRecord | undefined
  if (
    !record
    || typeof record.tarball !== 'string'
    || typeof record.sha256 !== 'string'
    || !/^[a-f0-9]{64}$/.test(record.sha256)
  )
    return null
  const tarballKey = storedBinaryObjectKey(record.tarball)
  const expectedKey = kind === 'tarball' ? tarballKey : `${tarballKey}.sha256`
  return expectedKey === s3Key ? record : null
}

// Ensure the requested binary object exists, materializing it from pkgx on a miss.
// Returns true when the object is now available to serve, false when neither S3 nor
// pkgx has it (caller returns its normal not-found error).
async function ensureBinaryAvailable(
  s3Key: string,
  client: ReturnType<typeof createS3Client>,
  publisher: BinaryArtifactPublisher,
): Promise<boolean> {
  try {
    await client.headObject(process.env.S3_BUCKET || 'pantry-registry', s3Key)
    return true
  }
  catch (error) {
    if (!isS3ObjectNotFound(error)) throw error
  }
  const m = parseBinaryKey(s3Key)
  if (!m)
    return false
  return !!(await materializeFromPkgx(m.domain, m.version, m.platform, publisher))
}

async function handleBinaryProxy(
  path: string,
  req: Request,
  analytics: AnalyticsStorage,
  corsHeaders: Record<string, string>,
  storage?: BinaryStorage,
  getPublisher?: () => BinaryArtifactPublisher,
): Promise<Response> {
  // HEAD is answered exactly like GET minus the body. Rejecting it left every
  // "does this artifact exist / has it changed" probe — ours and other
  // people's tooling — with no option but a full GET of the tarball.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }
  const bodyless = req.method === 'HEAD'

  // Strip leading slash to get S3 key: /binaries/curl.se/metadata.json -> binaries/curl.se/metadata.json
  //
  // The pathname is still percent-encoded here, but object keys hold the raw
  // characters — a Zig dev build really is stored under `0.17.0-dev.1859+dcceb318e`.
  // Using the encoded pathname made a spec-compliant client (which escapes `+`
  // to `%2B`) miss every such key and 404, while a client that left `+` literal
  // succeeded. Decode first so both spellings resolve to the same object.
  let s3Key: string
  try {
    s3Key = decodeURIComponent(path.slice(1))
  }
  catch {
    // Malformed escapes (`%zz`, a trailing `%`) throw rather than 500 the request.
    return Response.json({ error: 'Invalid path' }, { status: 400, headers: corsHeaders })
  }

  // Reject path traversal attempts. This runs on the DECODED key on purpose:
  // checking the encoded form would let `%2e%2e` walk out of the prefix.
  if (s3Key.includes('..') || /[\x00-\x1f]/.test(s3Key)) {
    return Response.json({ error: 'Invalid path' }, { status: 400, headers: corsHeaders })
  }

  // Determine content type and cache policy
  const isMetadata = s3Key.endsWith('/metadata.json')
  const isTarball = s3Key.endsWith('.tar.gz')
  const isChecksum = s3Key.endsWith('.sha256')
  if (!isMetadata && !isTarball && !isChecksum)
    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })

  const contentType = isMetadata ? 'application/json'
    : isTarball ? 'application/gzip'
    : isChecksum ? 'text/plain'
    : 'application/octet-stream'

  const cacheControl = isMetadata
    ? 'public, max-age=300'
    : (isTarball || isChecksum)
      ? 'public, max-age=86400, immutable'
      : 'public, max-age=300'

  // Use injected storage or fall back to S3 (cached singleton to avoid re-creating client per request)
  const binaryStore: BinaryStorage = storage || _defaultBinaryStorage || (() => {
    const s3Bucket = process.env.S3_BUCKET || 'pantry-registry'
    const s3 = createS3Client(resolveStorageProvider())
    _defaultBinaryStorage = { getObject: (key: string) => s3.getObjectBuffer(s3Bucket, key) }
    return _defaultBinaryStorage
  })()

  try {
    let activeRecord: ActiveBinaryRecord | null = null
    if (isTarball || isChecksum) {
      const kind = isTarball ? 'tarball' : 'checksum'
      activeRecord = await findActiveBinaryRecord(binaryStore, s3Key, kind, !storage)
      const parsed = parseBinaryKey(s3Key)
      if (!bodyless && !activeRecord && parsed && isPendingMaterialize(parsed.domain, parsed.version, parsed.platform)) {
        const tarballKey = isTarball ? s3Key : s3Key.slice(0, -'.sha256'.length)
        _presignClient ??= createS3Client(resolveStorageProvider())
        if (getPublisher && await ensureBinaryAvailable(tarballKey, _presignClient, getPublisher())) {
          // Materializing rewrote the manifest — the memo now holds the
          // pre-materialize copy that is missing this very record.
          invalidateBinaryMetadata(parsed.domain)
          activeRecord = await findActiveBinaryRecord(binaryStore, s3Key, kind, !storage)
        }
      }
      if (!activeRecord)
        return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })
      if (
        binaryAttestationRequired()
        && (
          activeRecord.malwareScan?.verdict !== 'clean'
          || activeRecord.malwareScan.artifactSha256 !== activeRecord.sha256
        )
      ) {
        return Response.json({
          error: 'Binary artifact has no clean malware-scan attestation',
          code: 'BINARY_SCAN_ATTESTATION_REQUIRED',
        }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
      }
    }

    // Both HEAD and GET require the same independent production attestation.
    // Reject before spending a client's budget or counting authorized bytes.
    if (isTarball && activeRecord && !storage && binaryAttestationRequired()) {
      _presignClient ??= createS3Client(resolveStorageProvider())
      if (!await hasCleanBinaryAttestation(_presignClient, process.env.S3_BUCKET || 'pantry-registry', s3Key, activeRecord.sha256)) {
        return Response.json({
          error: 'Binary artifact has no clean malware-scan attestation',
          code: 'BINARY_SCAN_ATTESTATION_REQUIRED',
        }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
      }
    }

    // A probe must never fetch an archive or redirect HEAD to a URL signed for
    // GET (SigV4 binds the HTTP method). Use the validated manifest for headers.
    if (bodyless && isTarball && activeRecord) {
      const size = Number(activeRecord.size)
      return new Response(null, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
          ...(Number.isFinite(size) && size >= 0 ? { 'Content-Length': String(size) } : {}),
        },
      })
    }

    // Charge the download against the caller's budget before handing over a
    // URL for it. The record's declared size is what the bucket will actually
    // serve, so the byte budget is measured in the same unit as the bill.
    if (isTarball && activeRecord) {
      _binaryRateLimiter ??= binaryRateLimiterFromEnv()
      const decision = _binaryRateLimiter.check(rateLimitClientKey(req), Number(activeRecord.size) || 0)
      if (!decision.allowed) {
        return Response.json({
          error: 'Too many binary downloads',
          code: 'BINARY_DOWNLOAD_RATE_LIMITED',
          limit: decision.limit,
          retryAfterSeconds: decision.retryAfterSeconds,
        }, {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': String(decision.retryAfterSeconds),
            'Cache-Control': 'no-store',
          },
        })
      }
    }

    // Bytes we authorized, recorded where the size is already known. Host
    // network counters cannot see this: the client is redirected to object
    // storage, so the transfer never touches this process.
    if (isTarball && activeRecord)
      getEgressLedger().record(Number(activeRecord.size) || 0, parseBinaryKey(s3Key)?.domain)

    // Track only authorized tarball downloads fire-and-forget.
    if (isTarball) {
      const parts = s3Key.split('/')
      if (parts.length >= 4) {
        const parsed = parseBinaryKey(s3Key)
        const domain = parsed?.domain || parts[1]
        const version = parsed?.version || parts[2]
        analytics.trackDownload({
          packageName: domain,
          version,
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || undefined,
        }).catch(err => console.warn('Analytics tracking failed:', err))
        analytics.trackEvent({
          packageName: domain,
          category: 'install',
          timestamp: new Date().toISOString(),
          version,
        }).catch(err => console.warn('Analytics tracking failed:', err))
      }

      // Stream tarball from ordinary injected storage, or use its explicit
      // redirect capability when a test/adapter models private object storage.
      if (storage && !storage.createDownloadUrl) {
        // Test/injected storage — serve from buffer
        try {
          const buffer = await storage.getObject(s3Key)
          return new Response(bodyless ? null : new Uint8Array(buffer), {
            headers: { ...corsHeaders, 'Content-Type': contentType, 'Cache-Control': cacheControl, 'Content-Length': String(buffer.byteLength) },
          })
        }
        catch (error) {
          if (!isS3ObjectNotFound(error)) throw error
          return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })
        }
      }
      if (storage?.createDownloadUrl) {
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': storage.createDownloadUrl(s3Key),
            'Content-Type': contentType,
            'Cache-Control': cacheControl,
          },
        })
      }

      // Production: redirect clients to the immutable object so large binary
      // artifacts aren't buffered through the registry process. AWS public
      // buckets get a plain (CDN-cacheable) URL; S3-compatible providers
      // (Hetzner/B2) use private buckets, so presign a time-limited GET URL.
      const s3Bucket = process.env.S3_BUCKET || 'pantry-registry'
      const resolved = resolveStorageProvider()
      let location: string
      let redirectCacheControl = cacheControl
      if (resolved.cdnBaseUrl) {
        // A CDN in front of the bucket only helps if every client is sent to the
        // same URL. Signing is what breaks that, so a configured CDN origin
        // replaces it outright: artifacts under binaries/ are public, immutable
        // for a given (domain, version, platform), and safe to cache forever.
        location = `${resolved.cdnBaseUrl}/${s3Key.split('/').map(encodeURIComponent).join('/')}`
        redirectCacheControl = 'public, max-age=31536000, immutable'
      }
      else if (resolved.provider === 'aws' && !resolved.endpoint) {
        location = `https://${s3Bucket}.s3.${resolved.region}.amazonaws.com/${s3Key}`
      }
      else {
        _presignClient ??= createS3Client(resolved)
        const { url, maxAgeSeconds } = presignBinaryDownload(_presignClient, s3Bucket, s3Key)
        location = url
        redirectCacheControl = `public, max-age=${maxAgeSeconds}`
      }
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': location,
          'Content-Type': contentType,
          'Cache-Control': redirectCacheControl,
        },
      })
    }

    // Metadata: serve the stored manifest, AUGMENTED with versions we track but
    // haven't published that pkgx can still provide — so the CLI can resolve and
    // install them (the bytes are materialized on first tarball fetch). The pkgx
    // probe is HEAD-verified + cached, so we never advertise a binary that 404s.
    // Production only (injected test storage keeps the raw manifest).
    if (isMetadata && !storage) {
      const domain = s3Key.startsWith('binaries/') && s3Key.endsWith('/metadata.json')
        ? s3Key.slice('binaries/'.length, -'/metadata.json'.length)
        : null
      let stored: Awaited<ReturnType<typeof augmentMetadataWithPkgx>> = null
      try { stored = domain ? await loadBinaryMetadata(binaryStore, domain, true) : null }
      catch (error) {
        // Only an absent object is an unpublished domain. Do not advertise an
        // empty or fallback manifest while its published metadata is unreadable.
        if (!isS3ObjectNotFound(error)) throw error
      }
      const augmented = domain
        ? await augmentMetadataWithPkgx(domain, stored, [...(_knownVersions.get(domain) || [])])
        : stored
      if (!augmented)
        return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })
      const visible = binaryAttestationRequired()
        ? filterBinaryMetadataForCleanScans(
            augmented as any,
            (domain, version, platform) => isPendingMaterialize(domain, version, platform),
          )
        : augmented
      const body = JSON.stringify(publicBinaryMetadata(visible as any))
      return new Response(bodyless ? null : body, {
        headers: { ...corsHeaders, 'Content-Type': contentType, 'Cache-Control': cacheControl, 'Content-Length': String(Buffer.byteLength(body)) },
      })
    }

    // Checksum (and metadata in tests): proxy the small file from storage. On a
    // checksum miss, materialize from pkgx first (which writes the .sha256), then retry.
    let buffer: Buffer
    try {
      buffer = await binaryStore.getObject(s3Key)
    }
    catch (missErr) {
      if (!isS3ObjectNotFound(missErr)) throw missErr
      const tarKey = s3Key.replace(/\.sha256$/, '')
      const ck = parseBinaryKey(tarKey)
      if (!isChecksum || storage || !ck || !isPendingMaterialize(ck.domain, ck.version, ck.platform))
        throw missErr
      const s3Bucket = process.env.S3_BUCKET || 'pantry-registry'
      _presignClient ??= createS3Client(resolveStorageProvider())
      if (!getPublisher || !await ensureBinaryAvailable(tarKey, _presignClient, getPublisher()))
        throw missErr
      buffer = await binaryStore.getObject(s3Key)
    }

    if (isChecksum && !storage && binaryAttestationRequired()) {
      const s3Bucket = process.env.S3_BUCKET || 'pantry-registry'
      _presignClient ??= createS3Client(resolveStorageProvider())
      if (!await hasCleanBinaryAttestation(
        _presignClient,
        s3Bucket,
        s3Key.replace(/\.sha256$/, ''),
        activeRecord!.sha256,
      )) {
        return Response.json({
          error: 'Binary artifact has no clean malware-scan attestation',
          code: 'BINARY_SCAN_ATTESTATION_REQUIRED',
        }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60' } })
      }
    }

    return new Response(bodyless ? null : new Uint8Array(buffer), {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Content-Length': String(buffer.length),
      },
    })
  }
  catch (error) {
    console.error(`Binary proxy error for ${s3Key}:`, error)
    if (!isS3ObjectNotFound(error)) {
      return Response.json({
        error: 'Binary storage is temporarily unavailable',
        code: 'BINARY_STORAGE_UNAVAILABLE',
      }, { status: 503, headers: { ...corsHeaders, 'Retry-After': '60', 'Cache-Control': 'no-store' } })
    }
    return Response.json(
      { error: 'Not found' },
      { status: 404, headers: corsHeaders },
    )
  }
}

/**
 * Handle dashboard routes — analytics UI (rendered via stx)
 */
// Read lazily (see getRegistryToken rationale above).
function getDashboardToken(): string | undefined {
  return process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN
}

function constantTimeEquals(a: string, b: string): boolean {
  const crypto = require('node:crypto')
  const maxLen = Math.max(a.length, b.length)
  const bufA = Buffer.alloc(maxLen)
  const bufB = Buffer.alloc(maxLen)
  Buffer.from(a).copy(bufA)
  Buffer.from(b).copy(bufB)
  return crypto.timingSafeEqual(bufA, bufB) && a.length === b.length
}

function getDashboardAuth(req: Request, url?: URL): boolean {
  const dashboardToken = getDashboardToken()
  if (!dashboardToken) return false

  // Check cookie first (direct access / cookie-forwarding CDN)
  const cookieHeader = req.headers.get('cookie') || ''
  // eslint-disable-next-line max-statements-per-line -- semicolon is inside regex, not a statement separator
  const cookieMatch = cookieHeader.match(/pantry_token=([^;]+)/)
  if (cookieMatch && constantTimeEquals(cookieMatch[1], dashboardToken))
    return true

  // Check Authorization header (CloudFront forwards this)
  const authHeader = req.headers.get('authorization') || ''
  if (authHeader.startsWith('Bearer ') && constantTimeEquals(authHeader.slice(7), dashboardToken)) return true

  // Check query parameter (CloudFront forwards query strings)
  if (url) {
    const tokenParam = url.searchParams.get('token')
    if (tokenParam && constantTimeEquals(tokenParam, dashboardToken)) return true
  }

  return false
}

async function handleDashboard(
  path: string,
  req: Request,
  url: URL,
  analytics: AnalyticsStorage,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const noCacheHeaders = {
    ...corsHeaders,
    'Cache-Control': 'no-cache, no-store',
  }
  const htmlHeaders = { ...noCacheHeaders, 'Content-Type': 'text/html' }

  // Helper to build dashboard URLs that preserve the auth token
  const tokenParam = url.searchParams.get('token') || ''
  // eslint-disable-next-line max-statements-per-line -- semicolon is inside regex, not a statement separator
  const tokenFromCookie = (req.headers.get('cookie') || '').match(/pantry_token=([^;]+)/)?.[1] || ''
  const activeToken = tokenParam || tokenFromCookie
  const qs = activeToken ? `?token=${encodeURIComponent(activeToken)}` : ''
  const qsAmp = activeToken ? `&token=${encodeURIComponent(activeToken)}` : ''

  // Logout
  if (path === '/dashboard/logout') {
    return new Response(null, {
      status: 302,
      headers: {
        ...noCacheHeaders,
        'Location': '/dashboard/login',
        'Set-Cookie': 'pantry_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    })
  }

  // Login page
  if (path === '/dashboard/login') {
    if (req.method === 'POST') {
      const formData = await req.formData()
      const token = formData.get('token') as string
      if (token === getDashboardToken()) {
        return new Response(null, {
          status: 302,
          headers: {
            ...noCacheHeaders,
            'Location': `/dashboard?token=${encodeURIComponent(token)}`,
            'Set-Cookie': `pantry_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
          },
        })
      }
      const html = await renderDashboardPage('login.stx', { error: 'Invalid token' })
      return new Response(html, { status: 401, headers: htmlHeaders })
    }
    const html = await renderDashboardPage('login.stx', {})
    return new Response(html, { headers: htmlHeaders })
  }

  // Auth gate for all other dashboard routes
  if (!getDashboardAuth(req, url)) {
    return new Response(null, {
      status: 302,
      headers: { ...noCacheHeaders, 'Location': '/dashboard/login' },
    })
  }

  // Dashboard API endpoints (JSON)
  if (path === '/dashboard/api/overview') {
    const topPackages = await analytics.getTopPackages(100)
    return Response.json({ packages: topPackages }, { headers: noCacheHeaders })
  }

  if (path === '/dashboard/api/requested-versions') {
    const allRequests = await analytics.getAllMissingVersionRequests(200)
    return Response.json({ requests: allRequests }, { headers: noCacheHeaders })
  }

  if (path.startsWith('/dashboard/api/package/')) {
    const packageName = decodeURIComponent(path.replace('/dashboard/api/package/', ''))
    const [stats, timeline] = await Promise.all([
      analytics.getPackageStats(packageName),
      analytics.getDownloadTimeline(packageName, 30),
    ])
    return Response.json({ stats, timeline }, { headers: noCacheHeaders })
  }

  // Package detail page
  if (path.startsWith('/dashboard/package/')) {
    const rawPackageName = decodeURIComponent(path.replace('/dashboard/package/', ''))
    const packageName = escapeHtml(rawPackageName)
    const [stats, timeline] = await Promise.all([
      analytics.getPackageStats(rawPackageName),
      analytics.getDownloadTimeline(rawPackageName, 30),
    ])

    // Generate charts via ts-charts
    const timelineData = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
    const lineChart = generateLineChart(timelineData, 600, 200)

    // Version distribution chart
    const versionDownloads = stats?.versionDownloads || {}
    const versionItems = Object.entries(versionDownloads)
      .map(([label, value]) => ({ label, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
    const versionChart = generateHorizontalBarChart(versionItems, 500, 24, 4, 100)

    const html = await renderDashboardPage('package.stx', { packageName, stats, timeline, lineChart, versionChart, qs, qsAmp })
    return new Response(html, { headers: htmlHeaders })
  }

  // Requested versions page
  if (path === '/dashboard/requested-versions') {
    const allRequests = await analytics.getAllMissingVersionRequests(500)
    const rawFilter = url.searchParams.get('filter') || 'known'
    const filter = ['known', 'unknown', 'all'].includes(rawFilter) ? rawFilter : 'known'
    const page = Math.min(Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1), 10000)

    // Top requested packages bar chart
    const pkgCounts = new Map<string, number>()
    for (const r of allRequests) {
      pkgCounts.set(r.packageName, (pkgCounts.get(r.packageName) || 0) + (r.requestCount || 0))
    }
    const topRequested = [...pkgCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({ label, value }))
    const requestsChart = generateHorizontalBarChart(topRequested, 600, 24, 4, 140)

    const html = await renderDashboardPage('requested-versions.stx', { requests: allRequests, filter, page, perPage: 25, requestsChart, qs, qsAmp })
    return new Response(html, { headers: htmlHeaders })
  }

  // Overview page (default)
  if (path === '/dashboard' || path === '/dashboard/') {
    const topPackages = await analytics.getTopPackages(100)
    const page = Math.min(Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1), 10000)

    // Generate sparklines for visible packages on current page
    const startIdx = (page - 1) * 25
    const visiblePkgs = topPackages.slice(startIdx, startIdx + 25)
    const pkgsWithSparklines = await Promise.all(
      visiblePkgs.map(async (pkg) => {
        const tl = await analytics.getDownloadTimeline(pkg.name, 14).catch(() => [])
        const sparkData = (tl || []).map((d: any) => d.count || 0)
        const sparkline = generateSparkline(sparkData, 80, 24)
        return { ...pkg, sparklinePath: sparkline.path, sparklineAreaPath: sparkline.areaPath }
      }),
    )

    // Build aggregate timeline for global chart from top 15 packages
    const allTimelines = await Promise.all(
      topPackages.slice(0, 15).map(async (pkg) => {
        const tl = await analytics.getDownloadTimeline(pkg.name, 30).catch(() => [])
        return tl || []
      }),
    )
    const dateMap = new Map<string, number>()
    for (const tl of allTimelines) {
      for (const d of tl) {
        dateMap.set(d.date, (dateMap.get(d.date) || 0) + (d.count || 0))
      }
    }
    const globalTimeline = [...dateMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
    const globalChart = generateLineChart(globalTimeline, 700, 180)

    // Downloads distribution bar chart (top 10)
    const top10Items = topPackages.slice(0, 10).map(p => ({ label: p.name, value: p.downloads }))
    const downloadsBar = generateHorizontalBarChart(top10Items, 600, 24, 4, 140)

    const html = await renderDashboardPage('overview.stx', {
      packages: topPackages,
      pkgsWithSparklines,
      page,
      perPage: 25,
      globalChart,
      downloadsBar,
      qs,
      qsAmp,
    })
    return new Response(html, { headers: htmlHeaders })
  }

  return Response.json({ error: 'Not found' }, { status: 404, headers: noCacheHeaders })
}

// ============================================================================
// Site route handlers
// ============================================================================

async function fetchPackageMetadata(domain: string, storage?: BinaryStorage): Promise<any> {
  try {
    const store: BinaryStorage = storage || (() => {
      const s3Bucket = process.env.S3_BUCKET || 'pantry-registry'
      const s3 = createS3Client(resolveStorageProvider())
      return { getObject: (key: string) => s3.getObjectBuffer(s3Bucket, key) }
    })()
    const buffer = await store.getObject(`binaries/${domain}/metadata.json`)
    return JSON.parse(Buffer.from(buffer).toString('utf-8'))
  }
  catch { return null }
}

async function listBinaryPackageVersions(domain: string, storage?: BinaryStorage): Promise<string[]> {
  const metadata = await fetchPackageMetadata(domain, storage)
  const versions = metadata?.versions
  if (!versions || typeof versions !== 'object') return []

  return Object.keys(versions).sort((a, b) => {
    const parsedA = parseSemver(a)
    const parsedB = parseSemver(b)
    if (parsedA && parsedB) return -compareSemver(parsedA, parsedB)
    return b.localeCompare(a)
  })
}

async function handleSiteHome(binaryStorage?: BinaryStorage, analyticsStorage?: AnalyticsStorage, zigStorage?: ZigPackageStorage): Promise<Response> {
  // Fetch featured package metadata + sparkline data in parallel
  const metaResults = await Promise.allSettled(
    FEATURED_PACKAGES.map(async (pkg) => {
      const [meta, timeline] = await Promise.all([
        fetchPackageMetadata(pkg.domain, binaryStorage),
        analyticsStorage?.getDownloadTimeline(pkg.domain, 14).catch(() => []) ?? [],
      ])
      const sparkData = (timeline || []).map((d: any) => d.count || 0)
      const sparkline = generateSparkline(sparkData, 60, 20)
      return {
        ...pkg,
        version: meta?.latestVersion || null,
        versionCount: meta?.versions ? Object.keys(meta.versions).length : 0,
        sparklinePath: sparkline.path,
        sparklineAreaPath: sparkline.areaPath,
      }
    }),
  )

  const packages = metaResults.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { ...FEATURED_PACKAGES[i], version: null, versionCount: 0, sparklinePath: '', sparklineAreaPath: '' },
  )

  // Fetch top packages and aggregate stats
  let topPackages: any[] = []
  let stats: Record<string, any> = {}
  if (analyticsStorage) {
    try {
      const [top, installAnalytics] = await Promise.all([
        analyticsStorage.getTopPackages(10),
        analyticsStorage.getInstallAnalytics(30).catch(() => null),
      ])

      const totalDownloads = top.reduce((sum, p) => sum + p.downloads, 0)

      // Generate sparklines for top packages
      const topWithSparklines = await Promise.all(
        top.map(async (pkg, i) => {
          const timeline = await analyticsStorage.getDownloadTimeline(pkg.name, 14).catch(() => [])
          const sparkData = (timeline || []).map((d: any) => d.count || 0)
          const sparkline = generateSparkline(sparkData, 80, 24)
          return {
            ...pkg,
            rank: i + 1,
            formattedDownloads: chartFormatCount(pkg.downloads),
            sparklinePath: sparkline.path,
            sparklineAreaPath: sparkline.areaPath,
          }
        }),
      )
      topPackages = topWithSparklines

      stats = {
        totalDownloads,
        formattedDownloads: chartFormatCount(totalDownloads),
        totalCount: installAnalytics?.total_count || 0,
      }
    }
    catch { /* analytics are optional */ }
  }

  const totalPackages = _knownVersions.size || 500
  const zigPackageCount = zigStorage ? await zigStorage.count().catch(() => 0) : 0
  const phpPackageCountRaw = await getPackagistCount().catch(() => 350000)
  const phpPackageCount = phpPackageCountRaw >= 1000 ? `${Math.floor(phpPackageCountRaw / 1000)}K` : String(phpPackageCountRaw)

  // Fetch desktop app metadata for homepage section
  const desktopFeatured = DESKTOP_APPS.filter(a =>
    ['code.visualstudio.com', 'discord.com', 'obsidian.md', 'spotify.com', 'figma.com',
      'ghostty.org', 'cursor.com', 'slack.com', 'firefox.org', 'docker.com/desktop',
      'ollama.com', 'raycast.com'].includes(a.domain),
  )
  const desktopResults = await Promise.allSettled(
    desktopFeatured.map(async (app) => {
      const meta = await fetchPackageMetadata(app.domain, binaryStorage).catch(() => null)
      return { ...app, version: meta?.latestVersion || null }
    }),
  )
  const desktopApps = desktopResults
    .map(r => r.status === 'fulfilled' ? r.value : null)
    .filter(Boolean)
  const desktopAppCount = DESKTOP_APPS.length

  const html = await renderSitePage('index.stx', { packages, totalPackages, zigPackageCount, phpPackageCount, topPackages, stats, desktopApps, desktopAppCount, canonicalUrl: 'https://pantry.dev/' })
  return htmlResponse(html)
}

async function handleSiteSearch(
  query: string,
  registry: Registry,
  binaryStorage?: BinaryStorage,
  analyticsStorage?: AnalyticsStorage,
  sort = 'relevance',
  view = 'list',
  type = 'all',
  zigStorage?: ZigPackageStorage,
  page = 1,
  phpStorage?: PhpPackageStorage,
): Promise<Response> {
  let results: any[] = []

  // PHP-only search — local storage first, then Packagist fallback
  if (type === 'php') {
    if (phpStorage) {
      const phpResults = await phpStorage.search(query || '', 50)
      results = phpResults.map(r => ({
        name: r.name,
        version: r.latest,
        description: r.description || '',
        keywords: r.keywords,
        packageType: 'php',
      }))
    }
    // Fall back to Packagist if no local results and we have a query
    if (results.length === 0 && query) {
      const packagistResults = await searchPackagist(query, 30).catch(() => [])
      results = packagistResults.map(r => ({
        name: r.name,
        version: '',
        description: r.description,
        downloads: r.downloads > 1000000 ? `${(r.downloads / 1000000).toFixed(1)}M` : r.downloads > 1000 ? `${(r.downloads / 1000).toFixed(0)}K` : String(r.downloads),
        downloadCount: r.downloads,
        packageType: 'php',
      }))
    }
  }

  // Zig-only search
  else if (type === 'zig' && zigStorage) {
    const zigResults = await zigStorage.search(query || '', 50)
    results = zigResults.map(r => ({
      name: r.name,
      version: r.latest,
      description: r.description || '',
      keywords: r.keywords,
      packageType: 'zig',
    }))
  }
  else if (query) {
    const searchResults = await registry.search(query, 50)
    results = searchResults || []

    // Also search Zig packages and merge if type is 'all'
    if (type === 'all' && zigStorage) {
      const zigResults = await zigStorage.search(query, 20).catch(() => [])
      const existingNames = new Set(results.map((r: any) => r.name))
      for (const zr of zigResults) {
        if (!existingNames.has(zr.name)) {
          results.push({
            name: zr.name,
            version: zr.latest,
            description: zr.description || '',
            keywords: zr.keywords,
            packageType: 'zig',
          })
        }
      }
    }

    // Also search PHP packages and merge if type is 'all'
    if (type === 'all') {
      // Local PHP storage
      if (phpStorage) {
        const phpResults = await phpStorage.search(query, 10).catch(() => [])
        const existingPhpNames = new Set(results.map((r: any) => r.name))
        for (const pr of phpResults) {
          if (!existingPhpNames.has(pr.name)) {
            results.push({
              name: pr.name,
              version: pr.latest,
              description: pr.description || '',
              keywords: pr.keywords,
              packageType: 'php',
            })
          }
        }
      }
    }

    const metaData = await fetchPackageMetadata(query, binaryStorage)
    if (metaData && metaData.name) {
      const exists = results.some((r: any) => r.name === metaData.name)
      if (!exists) {
        const latestVersion = metaData.latestVersion || ''
        const latestData = metaData.versions?.[latestVersion] || {}
        const platformKeys = Object.keys(latestData.platforms || {})
        const platformLabels = platformKeys.map((p: string) => {
          if (p.includes('darwin')) return 'macOS'
          if (p.includes('linux')) return 'Linux'
          return p
        }).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)

        results.unshift({
          name: metaData.name,
          version: latestVersion,
          description: metaData.description || `${Object.keys(metaData.versions || {}).length} versions available`,
          platforms: platformLabels,
        })
      }
    }

    // Enrich results with download stats (limit to first 20 to avoid excessive API calls)
    if (analyticsStorage) {
      const enrichLimit = Math.min(results.length, 20)
      const statsResults = await Promise.allSettled(
        results.slice(0, enrichLimit).map(async (r: any) => {
          const pkgStats = await analyticsStorage.getPackageStats(r.name)
          return { ...r, downloads: pkgStats ? chartFormatCount(pkgStats.totalDownloads) : '', downloadCount: pkgStats?.totalDownloads || 0 }
        }),
      )
      const enriched = statsResults.map((r, i) =>
        r.status === 'fulfilled' ? r.value : { ...results[i], downloads: '', downloadCount: 0 },
      )
      results = [...enriched, ...results.slice(enrichLimit)]
    }

    // Sort results
    if (sort === 'downloads') {
      results.sort((a: any, b: any) => (b.downloadCount || 0) - (a.downloadCount || 0))
    }
    else if (sort === 'name') {
      results.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''))
    }
  }

  // Pagination
  const perPage = 20
  const totalResults = results.length
  const totalPages = Math.max(1, Math.ceil(totalResults / perPage))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * perPage + 1
  const pageEnd = Math.min(safePage * perPage, totalResults)
  const pagedResults = results.slice((safePage - 1) * perPage, safePage * perPage)

  // Generate page numbers with ellipsis (represented as -1)
  const pageNumbers: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= safePage - 1 && i <= safePage + 1)) {
      pageNumbers.push(i)
    }
    else if (pageNumbers[pageNumbers.length - 1] !== -1) {
      pageNumbers.push(-1)
    }
  }

  const suggestions = ['python.org', 'nodejs.org', 'curl.se', 'go.dev', 'redis.io', 'postgresql.org', 'bun.sh', 'rust-lang.org']
  const html = await renderSitePage('search.stx', {
    query,
    encodedQuery: encodeURIComponent(query),
    results: pagedResults,
    sort,
    view,
    type,
    count: totalResults,
    hasResults: totalResults > 0 || type === 'zig' || type === 'php',
    hasQuery: query.length > 0 || type === 'zig' || type === 'php',
    suggestions,
    page: safePage,
    totalPages,
    pageStart,
    pageEnd,
    pageNumbers,
    title: type === 'zig' ? 'zig packages' : type === 'php' ? 'php packages' : query ? `search: ${query}` : 'search',
    metaDescription: type === 'zig' ? 'Browse Zig packages on pantry.dev' : type === 'php' ? 'Browse PHP/Composer packages on pantry.dev' : query ? `Search results for "${query}" on pantry.dev` : 'Search packages on pantry.dev',
    canonicalUrl: 'https://pantry.dev/search',
  })
  return htmlResponse(html)
}

async function handleSitePackage(
  name: string,
  analytics: AnalyticsStorage,
  binaryStorage?: BinaryStorage,
  registry?: Registry,
  zigStorage?: ZigPackageStorage,
  phpStorage?: PhpPackageStorage,
): Promise<Response> {
  // Resolve a package-name alias to its canonical domain (e.g. bun / bun.com → bun.sh)
  // so the page works for every name the CLI accepts, not just the canonical domain.
  const aliased = _aliases.get(name)
  if (aliased && aliased !== name)
    name = aliased

  // Paid packages: the page is where someone decides to buy, so it has to show
  // the price whether or not they can download the tarball. Every render below
  // goes through this wrapper so a new branch can't quietly drop it.
  const paywall = registry ? await registry.metadata.getPaywall(name).catch(() => null) : null
  const paidProps = paywall?.enabled
    ? {
        isPaid: true,
        priceLabel: formatPrice(paywall.price, paywall.currency),
        buyUrl: `/packages/${encodeURIComponent(name)}/buy`,
        freeVersionList: (paywall.freeVersions || []).join(', '),
        hasFreeVersions: (paywall.freeVersions || []).length > 0,
      }
    : { isPaid: false, priceLabel: '', buyUrl: '', freeVersionList: '', hasFreeVersions: false }

  const renderPackagePage = (props: Record<string, unknown>): Promise<string> =>
    renderSitePage('package.stx', { ...paidProps, ...props })
  const safeName = escapeHtml(name)
  const encodedName = encodeURIComponent(name)
  const [rawMeta, stats, timeline, pkgInfo, zigPkg, phpPkg] = await Promise.all([
    fetchPackageMetadata(name, binaryStorage),
    analytics.getPackageStats(name),
    analytics.getDownloadTimeline(name, 30),
    registry?.getPackage(name) ?? null,
    zigStorage?.getPackage(name) ?? null,
    phpStorage?.getPackage(name) ?? null,
  ])
  // Show every version a user can actually INSTALL, not just the eagerly-published
  // ones: augment the manifest with the pkgx-available versions the install path
  // materializes on demand (HEAD-verified + cached). Without this a popular package
  // like bun.sh reads "1 version" until the multi-version mirror catches up, even
  // though older releases install fine.
  let meta = rawMeta
  if (rawMeta) {
    meta = await augmentMetadataWithPkgx(name, rawMeta, [...(_knownVersions.get(name) || [])]).catch(() => rawMeta) ?? rawMeta
  }
  const isZigPackage = zigPkg !== null
  const isPhpPackage = phpPkg !== null

  // Packagist fallback for PHP packages (vendor/package format)
  let packagistPkg: any = null
  if (!meta && !pkgInfo && !zigPkg && !phpPkg && name.includes('/')) {
    packagistPkg = await fetchFromPackagist(name).catch(() => null)
  }

  if (!meta && !pkgInfo && !zigPkg && !phpPkg && !packagistPkg) {
    const html = await renderPackagePage({
      name, safeName, encodedName,
      notFound: true,
      isZigPackage: false,
      isPhpPackage: false,
      zigFetchUrl: '',
      meta: null,
      latestVersion: '',
      versions: [],
      platforms: [],
      stats: null,
      timeline: [],
      title: `${name} - not found`,
    })
    return htmlResponse(html, 404)
  }

  // Zig-only package (no S3 binary metadata or npm entry)
  if (!meta && !pkgInfo && zigPkg) {
    const zigVersions = zigStorage ? await zigStorage.listVersions(name) : []
    const zigTimeline = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
    const zigLineChart = generateLineChart(zigTimeline, 700, 200)
    const zigStats = stats || { totalDownloads: 0, weeklyDownloads: 0, monthlyDownloads: 0, versionDownloads: {} }

    const html = await renderPackagePage({
      name, safeName, encodedName,
      notFound: false,
      isZigPackage: true,
      isPhpPackage: false,
      zigFetchUrl: zigPkg.tarballUrl || '',
      latestVersion: zigPkg.version || 'unknown',
      versionCount: zigVersions.length || 1,
      platformCount: 0,
      platformLabels: [],
      formattedDownloads: chartFormatCount(zigStats.totalDownloads),
      formattedWeekly: chartFormatCount(zigStats.weeklyDownloads),
      pkgDescription: escapeHtml(zigPkg.description || ''),
      homepage: sanitizeUrl(zigPkg.homepage || ''),
      source: sanitizeUrl(zigPkg.repository || ''),
      depList: [],
      hasDeps: false,
      depCount: 0,
      sortedVersions: zigVersions.length ? zigVersions : [zigPkg.version],
      recentVersions: (zigVersions.length ? zigVersions : [zigPkg.version]).slice(0, 10),
      hasMoreVersions: zigVersions.length > 10,
      remainingCount: Math.max(0, zigVersions.length - 10),
      lineChart: zigLineChart,
      versionDistribution: { bars: [] },
      title: escapeHtml(name),
      metaDescription: escapeHtml(`${zigPkg.description || name} — A Zig package on pantry.dev`),
      canonicalUrl: `https://pantry.dev/package/${name}`,
    })
    return htmlResponse(html)
  }

  // PHP-only package (no S3 binary metadata or npm entry)
  if (!meta && !pkgInfo && phpPkg) {
    const phpVersions = phpStorage ? await phpStorage.listVersions(name) : []
    const phpTimeline = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
    const phpLineChart = generateLineChart(phpTimeline, 700, 200)
    const phpStats = stats || { totalDownloads: 0, weeklyDownloads: 0, monthlyDownloads: 0, versionDownloads: {} }
    const phpDeps = phpPkg.require ? Object.keys(phpPkg.require).filter(d => d !== 'php') : []

    const html = await renderPackagePage({
      name, safeName, encodedName,
      notFound: false,
      isZigPackage: false,
      isPhpPackage: true,
      zigFetchUrl: '',
      latestVersion: phpPkg.version || 'unknown',
      versionCount: phpVersions.length || 1,
      platformCount: 0,
      platformLabels: [],
      formattedDownloads: chartFormatCount(phpStats.totalDownloads),
      formattedWeekly: chartFormatCount(phpStats.weeklyDownloads),
      pkgDescription: escapeHtml(phpPkg.description || ''),
      homepage: sanitizeUrl(phpPkg.homepage || ''),
      source: sanitizeUrl(phpPkg.repository || ''),
      depList: phpDeps,
      hasDeps: phpDeps.length > 0,
      depCount: phpDeps.length,
      sortedVersions: phpVersions.length ? phpVersions : [phpPkg.version],
      recentVersions: (phpVersions.length ? phpVersions : [phpPkg.version]).slice(0, 10),
      hasMoreVersions: phpVersions.length > 10,
      remainingCount: Math.max(0, phpVersions.length - 10),
      lineChart: phpLineChart,
      versionDistribution: { bars: [] },
      title: escapeHtml(name),
      metaDescription: escapeHtml(`${phpPkg.description || name} — A PHP/Composer package on pantry.dev`),
      canonicalUrl: `https://pantry.dev/package/${name}`,
    })
    return htmlResponse(html)
  }

  // Packagist fallback — render PHP package from packagist.org
  if (packagistPkg) {
    const pkgTimeline = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
    const pkgLineChart = generateLineChart(pkgTimeline, 700, 200)
    const pkgStats = stats || { totalDownloads: 0, weeklyDownloads: 0, monthlyDownloads: 0, versionDownloads: {} }
    const pkgDeps = Object.keys(packagistPkg.require || {}).filter((d: string) => d !== 'php' && !d.startsWith('ext-'))
    const pkgVersions = (packagistPkg.versions || []) as string[]

    const html = await renderPackagePage({
      name, safeName, encodedName,
      notFound: false,
      isZigPackage: false,
      isPhpPackage: true,
      zigFetchUrl: '',
      latestVersion: packagistPkg.version || 'unknown',
      versionCount: pkgVersions.length,
      platformCount: 0,
      platformLabels: [],
      formattedDownloads: chartFormatCount(packagistPkg.downloads || pkgStats.totalDownloads),
      formattedWeekly: chartFormatCount(pkgStats.weeklyDownloads),
      pkgDescription: escapeHtml(packagistPkg.description || ''),
      homepage: sanitizeUrl(packagistPkg.homepage || ''),
      source: sanitizeUrl(packagistPkg.repository || ''),
      depList: pkgDeps,
      hasDeps: pkgDeps.length > 0,
      depCount: pkgDeps.length,
      sortedVersions: pkgVersions.slice(0, 50),
      recentVersions: pkgVersions.slice(0, 10),
      hasMoreVersions: pkgVersions.length > 10,
      remainingCount: Math.max(0, pkgVersions.length - 10),
      lineChart: pkgLineChart,
      versionDistribution: { bars: [] },
      title: escapeHtml(name),
      metaDescription: escapeHtml(`${packagistPkg.description || name} — A PHP/Composer package on pantry.dev`),
      canonicalUrl: `https://pantry.dev/package/${name}`,
    })
    return htmlResponse(html)
  }

  if (meta) {
    const versions = Object.keys(meta.versions || {})
    const latestVersion = meta.latestVersion || versions[0] || 'unknown'
    const latestData = meta.versions?.[latestVersion] || {}
    const platforms = Object.keys(latestData.platforms || {})

    // Pre-compute all template values (STX <script server> locals aren't accessible in template body)
    const pkgStats = stats || { totalDownloads: 0, weeklyDownloads: 0, monthlyDownloads: 0, versionDownloads: {} }
    const versionCount = versions.length
    const platformCount = platforms.length

    const platformLabels = platforms.map((p: string) => {
      if (p.includes('darwin-arm64')) return 'macOS (Apple Silicon)'
      if (p.includes('darwin-x86-64') || p.includes('darwin-x64')) return 'macOS (Intel)'
      if (p.includes('linux-arm64') || p.includes('linux-aarch64')) return 'Linux (ARM64)'
      if (p.includes('linux-x86-64') || p.includes('linux-x64')) return 'Linux (x86_64)'
      return p
    })

    const deps = meta.dependencies || {}
    const depList = Object.keys(deps)
    const hasDeps = depList.length > 0
    const depCount = depList.length

    // Sort newest-first by semver — the (augmented) manifest's key order is NOT
    // sorted, so a plain reverse() interleaves 1.2.x and 1.3.x.
    const sortedVersions = [...versions].sort((a, b) => {
      const pa = parseSemver(a)
      const pb = parseSemver(b)
      if (pa && pb) return -compareSemver(pa, pb)
      return b.localeCompare(a)
    })
    const recentVersions = sortedVersions.slice(0, 10)
    const hasMoreVersions = sortedVersions.length > 10
    const remainingCount = sortedVersions.length - 10

    // Generate charts via ts-charts
    const timelineData = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
    const lineChart = generateLineChart(timelineData, 700, 200)

    // Version distribution chart
    const versionDownloads = pkgStats.versionDownloads || {}
    const versionItems = Object.entries(versionDownloads)
      .map(([label, value]) => ({ label, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    const versionDistribution = generateHorizontalBarChart(versionItems, 600, 28, 6, 120)

    const pkgDescription = meta.description || `${name} — ${versionCount} versions available for macOS and Linux`
    const html = await renderPackagePage({
      name, safeName, encodedName,
      notFound: false,
      isZigPackage,
      isPhpPackage,
      zigFetchUrl: zigPkg?.tarballUrl || '',
      latestVersion,
      versionCount,
      platformCount,
      platformLabels,
      formattedDownloads: chartFormatCount(pkgStats.totalDownloads),
      formattedWeekly: chartFormatCount(pkgStats.weeklyDownloads),
      pkgDescription: escapeHtml(meta.description || ''),
      homepage: sanitizeUrl(meta.homepage || ''),
      source: sanitizeUrl(meta.source || meta.repository || ''),
      depList,
      hasDeps,
      depCount,
      sortedVersions,
      recentVersions,
      hasMoreVersions,
      remainingCount,
      lineChart,
      versionDistribution,
      title: escapeHtml(name),
      metaDescription: escapeHtml(`${pkgDescription} — Install with pantry.`),
      canonicalUrl: `https://pantry.dev/package/${name}`,
    })
    return htmlResponse(html)
  }

  // Fallback for packages only in npm registry (not S3)
  const fbTimeline = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
  const fbLineChart = generateLineChart(fbTimeline, 700, 200)
  const fbStats = stats || { totalDownloads: (pkgInfo as any)?.downloads || 0, weeklyDownloads: 0, monthlyDownloads: 0, versionDownloads: {} }
  const fbVersion = (pkgInfo as any)?.version || 'unknown'
  const fbVersions = fbVersion !== 'unknown' ? [fbVersion] : []

  const html = await renderPackagePage({
    name, safeName, encodedName,
    notFound: false,
    isZigPackage,
    isPhpPackage,
    zigFetchUrl: zigPkg?.tarballUrl || '',
    latestVersion: fbVersion,
    versionCount: fbVersions.length,
    platformCount: 0,
    platformLabels: [],
    formattedDownloads: chartFormatCount(fbStats.totalDownloads),
    formattedWeekly: chartFormatCount(fbStats.weeklyDownloads),
    pkgDescription: '',
    homepage: '',
    source: '',
    depList: [],
    hasDeps: false,
    depCount: 0,
    sortedVersions: [...fbVersions].reverse(),
    recentVersions: fbVersions.slice(0, 10),
    hasMoreVersions: false,
    remainingCount: 0,
    lineChart: fbLineChart,
    versionDistribution: { bars: [] },
    title: escapeHtml(name),
    metaDescription: escapeHtml(`${name} — Install with pantry.`),
    canonicalUrl: `https://pantry.dev/package/${name}`,
  })
  return htmlResponse(html)
}

// ============================================================================
// Compare page handler
// ============================================================================
async function handleSiteCompare(
  packagesParam: string,
  analyticsStorage: AnalyticsStorage,
  binaryStorage?: BinaryStorage,
): Promise<Response> {
  const packageNames = packagesParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 4)

  if (packageNames.length === 0) {
    const html = await renderSitePage('compare.stx', {
      comparePackages: [],
      hasPackages: false,
      packagesQuery: packagesParam,
      encodedPackagesQuery: encodeURIComponent(packagesParam),
      title: 'Compare',
      metaDescription: 'Compare packages side by side on pantry.dev — downloads, versions, and platform support.',
      canonicalUrl: 'https://pantry.dev/compare',
    })
    return htmlResponse(html)
  }

  // Fetch data for all packages in parallel
  const pkgDataResults = await Promise.allSettled(
    packageNames.map(async (name) => {
      const [meta, pkgStats, timeline] = await Promise.all([
        fetchPackageMetadata(name, binaryStorage),
        analyticsStorage.getPackageStats(name),
        analyticsStorage.getDownloadTimeline(name, 30).catch(() => []),
      ])

      const versions = meta?.versions ? Object.keys(meta.versions) : []
      const latestVersion = meta?.latestVersion || versions[0] || 'unknown'
      const latestData = meta?.versions?.[latestVersion] || {}
      const platforms = Object.keys(latestData.platforms || {})
      const deps = meta?.dependencies || {}
      const depCount = Object.keys(deps).length

      return {
        name: escapeHtml(name),
        description: escapeHtml(meta?.description || ''),
        latestVersion,
        totalDownloads: pkgStats?.totalDownloads || 0,
        formattedDownloads: chartFormatCount(pkgStats?.totalDownloads || 0),
        weeklyDownloads: pkgStats?.weeklyDownloads || 0,
        formattedWeekly: chartFormatCount(pkgStats?.weeklyDownloads || 0),
        versionCount: versions.length,
        platformCount: platforms.length,
        depCount,
        platforms,
        hasDarwinArm64: platforms.some(p => p.includes('darwin-arm64') || p.includes('darwin+aarch64')),
        hasDarwinX86: platforms.some(p => p.includes('darwin-x86') || p.includes('darwin+x86-64')),
        hasLinuxArm64: platforms.some(p => p.includes('linux-arm64') || p.includes('linux+aarch64')),
        hasLinuxX86: platforms.some(p => p.includes('linux-x86') || p.includes('linux+x86-64')),
        timeline: (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 })),
      }
    }),
  )

  const comparePackages = pkgDataResults
    // eslint-disable-next-line no-unused-vars
    .map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : {
            name: packageNames[i],
            description: '',
            latestVersion: '--',
            totalDownloads: 0,
            formattedDownloads: '--',
            weeklyDownloads: 0,
            formattedWeekly: '--',
            versionCount: 0,
            platformCount: 0,
            depCount: 0,
            platforms: [],
            hasDarwinArm64: false,
            hasDarwinX86: false,
            hasLinuxArm64: false,
            hasLinuxX86: false,
            timeline: [],
          },
    )

  // Generate multi-line download trend chart (ts-charts)
  const multiLineChart = generateMultiLineChart(
    comparePackages.map(pkg => ({
      label: pkg.name,
      timeline: pkg.timeline,
    })),
    700,
    250,
  )

  // Generate downloads bar chart for comparison
  const maxDownloads = Math.max(...comparePackages.map(p => p.totalDownloads), 1)
  const COMPARE_COLORS = ['#5b9cf5', '#6dd97a', '#e6c84d', '#e25c5c']
  const downloadsBarChart = {
    bars: comparePackages.map((pkg, i) => ({
      label: pkg.name,
      value: pkg.totalDownloads,
      formattedValue: pkg.formattedDownloads,
      widthPct: Math.max((pkg.totalDownloads / maxDownloads) * 100, 2).toFixed(1),
      color: COMPARE_COLORS[i % COMPARE_COLORS.length],
    })),
  }

  const html = await renderSitePage('compare.stx', {
    comparePackages,
    hasPackages: comparePackages.length > 0,
    packagesQuery: packagesParam,
      encodedPackagesQuery: encodeURIComponent(packagesParam),
    multiLineChart,
    downloadsBarChart,
    title: `Compare: ${packageNames.map(escapeHtml).join(' vs ')}`,
    metaDescription: `Compare ${packageNames.map(escapeHtml).join(', ')} — downloads, versions, and platform support on pantry.dev.`,
    canonicalUrl: 'https://pantry.dev/compare',
  })
  return htmlResponse(html)
}

// ============================================================================
// Stats page handler
// ============================================================================
// eslint-disable-next-line no-unused-vars
async function handleSiteStats(
  analyticsStorage: AnalyticsStorage,
): Promise<Response> {
  const [topPkgs, installAnalytics30, installAnalytics90] = await Promise.all([
    analyticsStorage.getTopPackages(25),
    analyticsStorage.getInstallAnalytics(30).catch(() => null),
    analyticsStorage.getInstallAnalytics(90).catch(() => null),
  ])

  const totalDownloads30 = topPkgs.reduce((sum, p) => sum + p.downloads, 0)
  const totalDownloads90 = (installAnalytics90 as any)?.total_count || totalDownloads30

  // Generate sparklines for each top package
  const topPackages = await Promise.all(
    topPkgs.map(async (pkg, i) => {
      const timeline = await analyticsStorage.getDownloadTimeline(pkg.name, 30).catch(() => [])
      const sparkData = (timeline || []).map((d: any) => d.count || 0)
      const sparkline = generateSparkline(sparkData, 80, 24)
      return {
        ...pkg,
        rank: i + 1,
        formattedDownloads: chartFormatCount(pkg.downloads),
        sharePct: totalDownloads30 > 0 ? ((pkg.downloads / totalDownloads30) * 100).toFixed(1) : '0',
        sparklinePath: sparkline.path,
        sparklineAreaPath: sparkline.areaPath,
      }
    }),
  )

  // Build aggregate timeline for global chart
  const allTimelines = await Promise.all(
    topPkgs.slice(0, 15).map(async (pkg) => {
      const tl = await analyticsStorage.getDownloadTimeline(pkg.name, 30).catch(() => [])
      return tl || []
    }),
  )

  // Aggregate by date
  const dateMap = new Map<string, number>()
  for (const tl of allTimelines) {
    for (const d of tl) {
      dateMap.set(d.date, (dateMap.get(d.date) || 0) + (d.count || 0))
    }
  }
  const globalTimeline = [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  const globalChart = generateLineChart(globalTimeline, 700, 220)

  const stats = {
    totalPackages: _knownVersions.size || 500,
    formatted30d: chartFormatCount(totalDownloads30),
    formatted90d: chartFormatCount(totalDownloads90),
    installAnalytics: installAnalytics30,
  }

  const html = await renderSitePage('stats.stx', {
    topPackages,
    stats,
    globalChart,
    title: 'Stats',
    metaDescription: 'pantry registry statistics — download trends, top packages, and install analytics.',
    canonicalUrl: 'https://pantry.dev/stats',
  })
  return htmlResponse(html)
}

// ============================================================================
// Badge API handler
// ============================================================================
const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

async function handleBadge(
  type: string,
  packageName: string,
  binaryStorage?: BinaryStorage,
  analyticsStorage?: AnalyticsStorage,
): Promise<Response> {
  let label = 'pantry'
  let value = 'unknown'
  let color = '#5b9cf5'

  try {
    if (type === 'version') {
      const meta = await fetchPackageMetadata(packageName, binaryStorage)
      value = meta?.latestVersion || 'unknown'
      color = '#6dd97a'
    }
    else if (type === 'downloads') {
      const stats = analyticsStorage ? await analyticsStorage.getPackageStats(packageName) : null
      value = stats ? chartFormatCount(stats.totalDownloads) : '0'
      label = 'downloads'
    }
    else if (type === 'platforms') {
      const meta = await fetchPackageMetadata(packageName, binaryStorage)
      const platforms = meta?.versions?.[meta?.latestVersion || '']?.platforms || {}
      value = `${Object.keys(platforms).length}`
      label = 'platforms'
      color = '#e6c84d'
    }
    else {
      return Response.json({ error: `Unknown badge type: ${type}` }, { status: 400 })
    }
  }
  catch {
    value = 'error'
    color = '#e25c5c'
  }

  // Generate SVG badge (shields.io style)
  const labelWidth = label.length * 7 + 12
  const valueWidth = value.length * 7 + 12
  const totalWidth = labelWidth + valueWidth
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${escapeXml(label)}: ${escapeXml(value)}">
  <title>${escapeXml(label)}: ${escapeXml(value)}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(label)}</text>
    <text x="${labelWidth / 2}" y="14">${escapeXml(label)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(value)}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${escapeXml(value)}</text>
  </g>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

/** Lazily built set of doc page paths for link rewriting (TTL-based to allow updates) */
let docsPageCache: Set<string> | null = null
let docsPageCacheAt = 0
const DOCS_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

async function getDocsPages(docsDir: string): Promise<Set<string>> {
  if (docsPageCache && Date.now() - docsPageCacheAt < DOCS_CACHE_TTL_MS) return docsPageCache
  const pages = new Set<string>(['/'])
  const { readdir } = await import('node:fs/promises')

  async function scan(dir: string, prefix: string) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== '404.html') {
          const name = entry.name.replace('.html', '')
          pages.add(name === 'index' ? prefix || '/' : `${prefix}/${name}`)
        }
        else if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await scan(resolve(dir, entry.name), `${prefix}/${entry.name}`)
        }
      }
    }
    catch { /* ignore missing dirs */ }
  }

  await scan(docsDir, '')
  docsPageCache = pages
  docsPageCacheAt = Date.now()
  return pages
}

function rewriteDocsLinks(html: string, docsPages: Set<string>): string {
  return html.replace(/href="(\/[^"]*?)"/g, (_match, href) => {
    if (docsPages.has(href)) {
      return `href="/docs${href === '/' ? '' : href}"`
    }
    return _match
  })
}

async function handleDocs(reqPath: string): Promise<Response> {
  const docsDir = resolve(__dirname, '../../../dist/.bunpress')
  const subPath = reqPath === '/docs' || reqPath === '/docs/'
    ? '/index.html'
    : reqPath.replace('/docs', '')

  const candidates = [
    resolve(docsDir, `.${subPath}`),
    resolve(docsDir, `.${subPath}.html`),
    resolve(docsDir, `.${subPath}/index.html`),
  ]

  for (const candidate of candidates) {
    // Prevent path traversal — resolved path must stay within docsDir
    if (relative(docsDir, candidate).startsWith('..')) continue
    const file = Bun.file(candidate)
    if (await file.exists()) {
      const ext = candidate.split('.').pop()

      if (ext === 'html') {
        const docsPages = await getDocsPages(docsDir)
        let html = await file.text()
        html = rewriteDocsLinks(html, docsPages)
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }

      const contentTypes: Record<string, string> = {
        css: 'text/css; charset=utf-8',
        js: 'application/javascript; charset=utf-8',
        json: 'application/json',
        svg: 'image/svg+xml',
        png: 'image/png',
        jpg: 'image/jpeg',
        ico: 'image/x-icon',
        woff2: 'font/woff2',
        woff: 'font/woff',
      }
      return new Response(file, {
        headers: {
          'Content-Type': contentTypes[ext || ''] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }
  }

  const indexFile = Bun.file(resolve(docsDir, 'index.html'))
  if (await indexFile.exists()) {
    const docsPages = await getDocsPages(docsDir)
    let html = await indexFile.text()
    html = rewriteDocsLinks(html, docsPages)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new Response('Documentation not found', { status: 404 })
}

// Run server if this is the main module
if (import.meta.main) {
  const port = Number.parseInt(process.env.PORT || '3000', 10)
  const analyticsTable = process.env.DYNAMODB_ANALYTICS_TABLE
  const awsRegion = process.env.AWS_REGION || 'us-east-1'

  // Use environment-based config (supports both local and production)
  const dynamoTable = process.env.DYNAMODB_TABLE || 'pantry-registry'
  const registry = createRegistryFromEnv()

  // Analytics persistence follows the storage provider: on a non-AWS provider
  // (Hetzner/B2) persist the aggregate analytics to a JSON object in the bucket
  // (durable + off-AWS, replacing the previously ephemeral in-memory analytics);
  // on AWS keep DynamoDB when a table is configured, else in-memory.
  const storage = resolveStorageProvider()
  let analytics: AnalyticsStorage
  if (storage.provider !== 'aws') {
    analytics = new ObjectAnalytics(createS3Client(storage), process.env.S3_BUCKET || 'pantry-registry')
  }
  else {
    analytics = createAnalytics(
      analyticsTable ? { tableName: analyticsTable, region: awsRegion } : undefined,
    )
  }

  // Ensure auth storage uses the same DynamoDB table as the registry
  const authStorage = createAuthStorage(dynamoTable, awsRegion)

  const zigStorage = createZigStorage()
  const phpStorage = createPhpStorage()
  // Hydrate durable state before accepting any request that can mutate it.
  // Only a confirmed missing object can initialize an empty registry.
  await Promise.all([registry.metadata, analytics, authStorage, zigStorage, phpStorage].map(async (store) => {
    if ('ready' in store && typeof store.ready === 'function')
      await store.ready()
  }))

  const server = createServer(registry, port, analytics, zigStorage, undefined, phpStorage, authStorage)
  server.start()
  installRegistryShutdown(server, [registry.metadata, analytics, authStorage, zigStorage, phpStorage, _buildStatus, { flush: flushEgressLedger }])

  console.log('\nEnvironment:')
  console.log(`  S3_BUCKET: ${process.env.S3_BUCKET || 'local'}`)
  console.log(`  DYNAMODB_TABLE: ${process.env.DYNAMODB_TABLE || 'pantry-registry'}`)
  console.log(`  BASE_URL: ${process.env.BASE_URL || `http://localhost:${port}`}`)
}
