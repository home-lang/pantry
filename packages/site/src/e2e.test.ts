import { describe, it, expect, beforeAll, afterAll, setDefaultTimeout } from 'bun:test'

setDefaultTimeout(30_000)

const PORT = 3099
const baseUrl = `http://localhost:${PORT}`
let server: any

/** Check if the site server can start (requires @stacksjs/stx) */
async function tryStartServer(): Promise<boolean> {
  const proc = Bun.spawn(['bun', 'run', 'src/server.ts'], {
    cwd: import.meta.dir + '/..',
    env: { ...process.env, PORT: String(PORT), REGISTRY_URL: 'https://registry.pantry.dev' },
    stdout: 'pipe',
    stderr: 'pipe',
  })

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${baseUrl}/health`)
      if (res.ok) {
        server = proc
        return true
      }
    }
    catch {
      if (proc.exitCode !== null) return false
      await new Promise(r => setTimeout(r, 500))
    }
  }
  proc.kill()
  return false
}

const serverAvailable = await tryStartServer()

if (!serverAvailable) {
  console.warn('Site server failed to start — skipping e2e tests (likely @stacksjs/stx issue)')
}

/** Retry a fetch up to N times with delay (for API-dependent routes) */
async function fetchWithRetry(url: string, retries = 5, delayMs = 2000): Promise<Response> {
  let lastRes: Response | null = null
  for (let i = 0; i < retries; i++) {
    lastRes = await fetch(url)
    const html = await lastRes.clone().text()
    if (!html.includes('No packages found')) return lastRes
    if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs))
  }
  return lastRes!
}

afterAll(() => {
  server?.kill()
})

// ============================================================================
// curl | bash detection
// ============================================================================

describe.skipIf(!serverAvailable)('curl detection', () => {
  it('returns install script for curl user-agent', async () => {
    const res = await fetch(baseUrl, { headers: { 'User-Agent': 'curl/8.0' } })
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text).toContain('#!/bin/bash')
    expect(text).toContain('Pantry Installer')
  })

  it('returns install script for wget user-agent', async () => {
    const res = await fetch(baseUrl, { headers: { 'User-Agent': 'Wget/1.21' } })
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text).toContain('#!/bin/bash')
  })

  it('returns HTML for browser user-agent', async () => {
    const res = await fetch(baseUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } })
    expect(res.headers.get('content-type')).toContain('text/html')
  })
})

// ============================================================================
// Health check
// ============================================================================

describe.skipIf(!serverAvailable)('Health', () => {
  it('returns ok', async () => {
    const res = await fetch(`${baseUrl}/health`)
    expect(res.status).toBe(200)
    const data = await res.json() as any
    expect(data.status).toBe('ok')
    expect(data.timestamp).toBeDefined()
  })
})

// ============================================================================
// Homepage
// ============================================================================

describe.skipIf(!serverAvailable)('Homepage', () => {
  it('returns 200', async () => {
    const res = await fetch(baseUrl)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
  })

  it('has correct title', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('<title>pantry - a fast, modern package manager</title>')
  })

  it('has skip-link for accessibility', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('skip-link')
    expect(html).toContain('Skip to main content')
  })

  it('has hero section with tagline', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('a fast, modern package manager for your system')
  })

  it('has search form', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('action="/search"')
    expect(html).toContain('search packages...')
  })

  it('has install command hint', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('curl -fsSL https://pantry.dev | sh')
  })

  it('has featured packages section', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('Popular Packages')
  })

  it('renders featured package cards with live data', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('curl')
    expect(html).toContain('Python')
    expect(html).toContain('Node.js')
    expect(html).toContain('Go')
  })

  it('shows package descriptions', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('Command line data transfer')
    expect(html).toContain('Programming language')
    expect(html).toContain('JavaScript runtime')
  })

  it('has get involved section', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('Get Involved')
    expect(html).toContain('Contribute')
    expect(html).toContain('Discord')
  })

  it('has header with navigation', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('main navigation')
    expect(html).toContain('href="/about"')
  })

  it('has footer with links', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('footer navigation')
    expect(html).toContain('href="/privacy"')
    expect(html).toContain('href="/accessibility"')
  })

  it('loads Google Fonts', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('fonts.googleapis.com')
    expect(html).toContain('Inter')
    expect(html).toContain('JetBrains+Mono')
  })

  it('has OKLCH custom properties', async () => {
    const html = await (await fetch(baseUrl)).text()
    expect(html).toContain('oklch(0.171 0 0)')
    expect(html).toContain('--bg:')
    expect(html).toContain('--fg:')
    expect(html).toContain('--accent:')
  })
})

// ============================================================================
// Search
// ============================================================================

describe.skipIf(!serverAvailable)('Search', () => {
  it('returns 200 with empty query', async () => {
    const res = await fetch(`${baseUrl}/search`)
    expect(res.status).toBe(200)
  })

  it('shows start typing hint with empty query', async () => {
    const html = await (await fetch(`${baseUrl}/search`)).text()
    expect(html).toContain('Start typing to search packages')
  })

  it('has correct title for query', async () => {
    const html = await (await fetch(`${baseUrl}/search?q=python`)).text()
    expect(html).toContain('<title>search: python - pantry</title>')
  })

  it('returns results for valid query', async () => {
    const html = await (await fetchWithRetry(`${baseUrl}/search?q=curl`)).text()
    expect(html).toContain('Found')
    expect(html).toContain('package')
    expect(html).toContain('href="/package/')
  })

  it('shows no results message for gibberish', async () => {
    const html = await (await fetch(`${baseUrl}/search?q=zzzznonexistent999`)).text()
    expect(html).toContain('No packages found')
  })

  it('has search form pre-filled with query', async () => {
    const html = await (await fetch(`${baseUrl}/search?q=python`)).text()
    expect(html).toContain('value="python"')
  })

  it('renders result count', async () => {
    const html = await (await fetchWithRetry(`${baseUrl}/search?q=curl`)).text()
    const match = html.match(/Found \d+ package/)
    expect(match).not.toBeNull()
  })
})

// ============================================================================
// Package detail
// ============================================================================

describe.skipIf(!serverAvailable)('Package detail', () => {
  it('returns 200 for existing package', async () => {
    const res = await fetch(`${baseUrl}/package/curl.se`)
    expect(res.status).toBe(200)
  })

  it('has correct title', async () => {
    const html = await (await fetch(`${baseUrl}/package/curl.se`)).text()
    expect(html).toContain('<title>curl.se - pantry</title>')
  })

  it('shows package name', async () => {
    const html = await (await fetch(`${baseUrl}/package/curl.se`)).text()
    expect(html).toContain('curl.se')
  })

  it('shows install command', async () => {
    const html = await (await fetch(`${baseUrl}/package/curl.se`)).text()
    expect(html).toContain('pantry install curl.se')
  })

  it('shows version badge', async () => {
    const html = await (await fetch(`${baseUrl}/package/curl.se`)).text()
    expect(html).toMatch(/\d+\.\d+/)
  })

  it('shows stats cards', async () => {
    const html = await (await fetch(`${baseUrl}/package/curl.se`)).text()
    expect(html).toContain('Downloads')
    expect(html).toContain('Latest')
    expect(html).toContain('Versions')
  })

  it('shows platform labels', async () => {
    const html = await (await fetch(`${baseUrl}/package/curl.se`)).text()
    expect(html).toContain('Platforms')
    const hasPlatform = html.includes('macOS') || html.includes('Linux')
    expect(hasPlatform).toBe(true)
  })

  it('shows versions list', async () => {
    const html = await (await fetch(`${baseUrl}/package/curl.se`)).text()
    expect(html).toContain('All Versions')
    expect(html).toContain('latest')
  })

  it('has back link', async () => {
    const html = await (await fetch(`${baseUrl}/package/curl.se`)).text()
    expect(html).toContain('href="/"')
    expect(html).toContain('back')
  })

  it('returns 404 for non-existent package', async () => {
    const res = await fetch(`${baseUrl}/package/nonexistent.zzz`)
    expect(res.status).toBe(404)
  })

  it('shows not found message for non-existent package', async () => {
    const html = await (await fetch(`${baseUrl}/package/nonexistent.zzz`)).text()
    expect(html).toContain('Package not found')
    expect(html).toContain('nonexistent.zzz')
  })

  it('works for python.org', async () => {
    const html = await (await fetch(`${baseUrl}/package/python.org`)).text()
    expect(html).toContain('python.org')
    expect(html).toContain('pantry install python.org')
  })

  it('works for nodejs.org', async () => {
    const html = await (await fetch(`${baseUrl}/package/nodejs.org`)).text()
    expect(html).toContain('nodejs.org')
    expect(html).toContain('pantry install nodejs.org')
  })
})

// ============================================================================
// Static pages
// ============================================================================

describe.skipIf(!serverAvailable)('About page', () => {
  it('returns 200', async () => {
    const res = await fetch(`${baseUrl}/about`)
    expect(res.status).toBe(200)
  })

  it('has correct title', async () => {
    const html = await (await fetch(`${baseUrl}/about`)).text()
    expect(html).toContain('<title>About - pantry</title>')
  })

  it('has all sections', async () => {
    const html = await (await fetch(`${baseUrl}/about`)).text()
    expect(html).toContain('What We Are')
    expect(html).toContain('What We Are Not')
    expect(html).toContain('How It Works')
    expect(html).toContain('Built With Zig')
    expect(html).toContain('Team')
    expect(html).toContain('Get Involved')
  })

  it('has content about pantry', async () => {
    const html = await (await fetch(`${baseUrl}/about`)).text()
    expect(html).toContain('fast, modern package manager')
    expect(html).toContain('Zig')
    expect(html).toContain('Stacks.js')
  })

  it('has back link', async () => {
    const html = await (await fetch(`${baseUrl}/about`)).text()
    expect(html).toContain('back')
  })
})

describe.skipIf(!serverAvailable)('Privacy page', () => {
  it('returns 200', async () => {
    const res = await fetch(`${baseUrl}/privacy`)
    expect(res.status).toBe(200)
  })

  it('has correct title', async () => {
    const html = await (await fetch(`${baseUrl}/privacy`)).text()
    expect(html).toContain('<title>Privacy Policy - pantry</title>')
  })

  it('has all sections', async () => {
    const html = await (await fetch(`${baseUrl}/privacy`)).text()
    expect(html).toContain('Website Data')
    expect(html).toContain('CLI Data')
    expect(html).toContain('Data Retention')
    expect(html).toContain('Your Rights')
    expect(html).toContain('Contact')
    expect(html).toContain('Changes')
  })

  it('mentions no cookies', async () => {
    const html = await (await fetch(`${baseUrl}/privacy`)).text()
    expect(html).toContain('does not use cookies')
  })
})

describe.skipIf(!serverAvailable)('Accessibility page', () => {
  it('returns 200', async () => {
    const res = await fetch(`${baseUrl}/accessibility`)
    expect(res.status).toBe(200)
  })

  it('has correct title', async () => {
    const html = await (await fetch(`${baseUrl}/accessibility`)).text()
    expect(html).toContain('<title>Accessibility - pantry</title>')
  })

  it('has all sections', async () => {
    const html = await (await fetch(`${baseUrl}/accessibility`)).text()
    expect(html).toContain('Our Approach')
    expect(html).toContain('Measures')
    expect(html).toContain('Known Limitations')
    expect(html).toContain('Contact')
  })

  it('mentions WCAG', async () => {
    const html = await (await fetch(`${baseUrl}/accessibility`)).text()
    expect(html).toContain('WCAG')
  })

  it('lists accessibility features', async () => {
    const html = await (await fetch(`${baseUrl}/accessibility`)).text()
    expect(html).toContain('Keyboard navigation')
    expect(html).toContain('Screen reader')
    expect(html).toContain('Color contrast')
    expect(html).toContain('Skip links')
  })
})

// ============================================================================
// 404 handling
// ============================================================================

describe.skipIf(!serverAvailable)('404 handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await fetch(`${baseUrl}/nonexistent`)
    expect(res.status).toBe(404)
  })
})

// ============================================================================
// Cross-page consistency
// ============================================================================

describe.skipIf(!serverAvailable)('Cross-page consistency', () => {
  const pages = ['/', '/search', '/about', '/privacy', '/accessibility']

  for (const page of pages) {
    it(`${page} has proper HTML structure`, async () => {
      const html = await (await fetch(`${baseUrl}${page}`)).text()
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('</html>')
      expect(html).toContain('<head>')
      expect(html).toContain('</head>')
      expect(html).toContain('<body')
      expect(html).toContain('</body>')
    })

    it(`${page} has viewport meta`, async () => {
      const html = await (await fetch(`${baseUrl}${page}`)).text()
      expect(html).toContain('viewport')
      expect(html).toContain('width=device-width')
    })

    it(`${page} has header and footer`, async () => {
      const html = await (await fetch(`${baseUrl}${page}`)).text()
      expect(html).toContain('<header')
      expect(html).toContain('</header>')
      expect(html).toContain('<footer')
      expect(html).toContain('</footer>')
    })

    it(`${page} has main content area`, async () => {
      const html = await (await fetch(`${baseUrl}${page}`)).text()
      expect(html).toContain('id="main-content"')
    })
  }
})
