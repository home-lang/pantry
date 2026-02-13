/**
 * Client-Side Web Scraper - Handles JavaScript-rendered sites
 *
 * This scraper can extract data from client-side rendered applications
 * (React, Vue, Next.js, etc.) by analyzing JavaScript bundles and finding
 * API endpoints or embedded data.
 *
 * Uses ONLY Bun native APIs - no external dependencies!
 */

export interface ClientSideScraperOptions {
  /**
   * Timeout in milliseconds
   * @default 30000
   */
  timeout?: number

  /**
   * Custom headers
   */
  headers?: Record<string, string>

  /**
   * User agent
   * @default 'Mozilla/5.0 (compatible; BunScraper/1.0)'
   */
  userAgent?: string

  /**
   * Whether to analyze JavaScript bundles
   * @default true
   */
  analyzeJavaScript?: boolean

  /**
   * Whether to look for embedded data
   * @default true
   */
  findEmbeddedData?: boolean

  /**
   * Whether to attempt API reconstruction
   * @default true
   */
  reconstructAPI?: boolean

  /**
   * Maximum number of JS files to analyze
   * @default 10
   */
  maxJSFiles?: number
}

export interface ScrapedData {
  /**
   * Raw HTML from the page
   */
  html: string

  /**
   * Extracted script URLs
   */
  scriptUrls: string[]

  /**
   * Found API endpoints
   */
  apiEndpoints: string[]

  /**
   * Embedded data (like __NEXT_DATA__, Redux state, etc.)
   */
  embeddedData: Record<string, any>

  /**
   * API responses (if we successfully called them)
   */
  apiResponses: Map<string, any>

  /**
   * Meta information
   */
  meta: {
    title?: string
    description?: string
    [key: string]: any
  }
}

/**
 * Scrape a client-side rendered website
 */
export async function scrapeClientSide(
  url: string,
  options: ClientSideScraperOptions = {},
): Promise<ScrapedData> {
  const {
    timeout = 30000,
    headers = {},
    userAgent = 'Mozilla/5.0 (compatible; BunScraper/1.0)',
    analyzeJavaScript = true,
    findEmbeddedData = true,
    reconstructAPI = true,
    maxJSFiles = 10,
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // Step 1: Fetch the initial HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...headers,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const baseUrl = new URL(url).origin

    const result: ScrapedData = {
      html,
      scriptUrls: [],
      apiEndpoints: [],
      embeddedData: {},
      apiResponses: new Map(),
      meta: {},
    }

    // Step 2: Extract meta information
    result.meta = extractMetaInfo(html)

    // Step 3: Find embedded data in the HTML
    if (findEmbeddedData) {
      result.embeddedData = await extractEmbeddedData(html)
    }

    // Step 4: Extract script URLs
    result.scriptUrls = extractScriptUrls(html, baseUrl)

    // Step 5: Analyze JavaScript bundles to find API endpoints
    if (analyzeJavaScript && result.scriptUrls.length > 0) {
      const endpoints = await analyzeJavaScriptBundles(
        result.scriptUrls.slice(0, maxJSFiles),
        baseUrl,
        timeout,
      )
      result.apiEndpoints = endpoints
    }

    // Step 6: Try to fetch data from discovered API endpoints
    if (reconstructAPI && result.apiEndpoints.length > 0) {
      const apiData = await fetchAPIEndpoints(
        result.apiEndpoints,
        url,
        timeout,
      )
      result.apiResponses = apiData
    }

    return result
  }
  finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Extract meta information from HTML
 */
function extractMetaInfo(html: string): Record<string, any> {
  const meta: Record<string, any> = {}

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    meta.title = titleMatch[1].trim()
  }

  // Extract meta tags
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const metaRegex = /<meta\s+([^>]+)>/gi
  let match = metaRegex.exec(html)

  while (match !== null) {
    const attrs = match[1]
    const nameMatch = attrs.match(/name=["']([^"']+)["']/i)
    const propertyMatch = attrs.match(/property=["']([^"']+)["']/i)
    const contentMatch = attrs.match(/content=["']([^"']+)["']/i)

    if ((nameMatch || propertyMatch) && contentMatch) {
      const key = (nameMatch?.[1] || propertyMatch?.[1] || '').replace(/^og:/, '')
      meta[key] = contentMatch[1]
    }

    match = metaRegex.exec(html)
  }

  return meta
}

/**
 * Extract embedded data from common patterns
 */
async function extractEmbeddedData(html: string): Promise<Record<string, any>> {
  const embedded: Record<string, any> = {}

  // Pattern 1: __NEXT_DATA__ (Next.js)
  const nextDataMatch = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)
  if (nextDataMatch) {
    try {
      embedded.__NEXT_DATA__ = JSON.parse(nextDataMatch[1])
    }
    catch {
      // Invalid JSON
    }
  }

  // Pattern 2: window.__INITIAL_STATE__ or similar
  const statePatterns = [
    /window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s,
    /window\.__STATE__\s*=\s*(\{.*?\});/s,
    /window\.INITIAL_DATA\s*=\s*(\{.*?\});/s,
    /window\.__APOLLO_STATE__\s*=\s*(\{.*?\});/s,
  ]

  for (const pattern of statePatterns) {
    const match = html.match(pattern)
    if (match) {
      try {
        const key = pattern.source.match(/window\.([A-Z_]+)/)?.[1] || 'state'
        embedded[key] = JSON.parse(match[1])
      }
      catch {
        // Invalid JSON
      }
    }
  }

  // Pattern 3: Inline JSON-LD
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis
  let jsonLdMatch = jsonLdRegex.exec(html)
  const jsonLdData: any[] = []

  while (jsonLdMatch !== null) {
    try {
      jsonLdData.push(JSON.parse(jsonLdMatch[1]))
    }
    catch {
      // Invalid JSON
    }
    jsonLdMatch = jsonLdRegex.exec(html)
  }

  if (jsonLdData.length > 0) {
    embedded.jsonLd = jsonLdData
  }

  return embedded
}

/**
 * Extract script URLs from HTML
 */
function extractScriptUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = []
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi
  let match = scriptRegex.exec(html)

  while (match !== null) {
    let url = match[1]

    // Convert relative URLs to absolute
    if (url.startsWith('/')) {
      url = baseUrl + url
    }
    else if (!url.startsWith('http')) {
      url = `${baseUrl}/${url}`
    }

    // Skip external scripts
    if (url.startsWith(baseUrl) || !url.includes('://')) {
      urls.push(url)
    }

    match = scriptRegex.exec(html)
  }

  return urls
}

/**
 * Analyze JavaScript bundles to find API endpoints
 */
async function analyzeJavaScriptBundles(
  scriptUrls: string[],
  baseUrl: string,
  timeout: number,
): Promise<string[]> {
  const endpoints = new Set<string>()

  const analysisPromises = scriptUrls.map(async (scriptUrl) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(scriptUrl, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok)
        return

      const jsContent = await response.text()

      // Find API patterns in the JavaScript
      const patterns = [
        // API endpoints
        /['"`](\/api\/[^'"`\s]+)['"`]/g,
        /['"`](https?:\/\/[^'"`\s]+\/api\/[^'"`\s]+)['"`]/g,

        // Fetch calls
        /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,

        // axios/request calls
        /(?:axios|request)\s*\.\s*(?:get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,

        // API base URLs
        /(?:baseURL|apiUrl|endpoint)\s*[:=]\s*['"`]([^'"`]+)['"`]/g,

        // Route patterns
        /['"`](\/pkgs\/[^'"`\s]+)['"`]/g,
      ]

      for (const pattern of patterns) {
        let match = pattern.exec(jsContent)
        while (match !== null) {
          let endpoint = match[1]

          // Clean up the endpoint
          if (endpoint.startsWith('/')) {
            endpoint = baseUrl + endpoint
          }
          else if (!endpoint.startsWith('http')) {
            endpoint = `${baseUrl}/${endpoint}`
          }

          // Filter out obvious non-API URLs
          if (!endpoint.includes('.js') && !endpoint.includes('.css') && !endpoint.includes('.png')) {
            endpoints.add(endpoint)
          }

          match = pattern.exec(jsContent)
        }
      }
    }
    catch {
      // Ignore fetch errors
    }
  })

  await Promise.all(analysisPromises)

  return Array.from(endpoints)
}

/**
 * Fetch data from discovered API endpoints
 */
async function fetchAPIEndpoints(
  endpoints: string[],
  refererUrl: string,
  timeout: number,
): Promise<Map<string, any>> {
  const responses = new Map<string, any>()

  // Try to determine which endpoints are most likely to contain data
  const prioritizedEndpoints = prioritizeEndpoints(endpoints, refererUrl)

  const fetchPromises = prioritizedEndpoints.slice(0, 5).map(async (endpoint) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout / 2)

      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          Referer: refererUrl,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''

        if (contentType.includes('json')) {
          const data = await response.json()
          responses.set(endpoint, data)
        }
        else {
          const text = await response.text()
          responses.set(endpoint, text)
        }
      }
    }
    catch {
      // Ignore fetch errors
    }
  })

  await Promise.all(fetchPromises)

  return responses
}

/**
 * Prioritize endpoints based on URL patterns
 */
function prioritizeEndpoints(endpoints: string[], refererUrl: string): string[] {
  const url = new URL(refererUrl)
  const pathSegments = url.pathname.split('/').filter(Boolean)

  return endpoints.sort((a, b) => {
    let scoreA = 0
    let scoreB = 0

    // Prefer endpoints that match the current path
    for (const segment of pathSegments) {
      if (a.includes(segment))
        scoreA += 10
      if (b.includes(segment))
        scoreB += 10
    }

    // Prefer JSON endpoints
    if (a.includes('.json'))
      scoreA += 5
    if (b.includes('.json'))
      scoreB += 5

    // Prefer /api/ endpoints
    if (a.includes('/api/'))
      scoreA += 3
    if (b.includes('/api/'))
      scoreB += 3

    // Prefer shorter URLs (more likely to be data endpoints)
    scoreA -= a.length / 100
    scoreB -= b.length / 100

    return scoreB - scoreA
  })
}

/**
 * Helper: Extract data from a client-side rendered page automatically
 */
export async function extractData(
  url: string,
  options: ClientSideScraperOptions = {},
): Promise<any> {
  const scraped = await scrapeClientSide(url, options)

  // Try to return the most relevant data
  // Priority: embedded data -> API responses -> meta

  if (Object.keys(scraped.embeddedData).length > 0) {
    return scraped.embeddedData
  }

  if (scraped.apiResponses.size > 0) {
    // Return the first successful API response
    return Array.from(scraped.apiResponses.values())[0]
  }

  return scraped.meta
}

/**
 * Check if a site is client-side rendered
 */
export async function isClientSideRendered(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BunScraper/1.0)',
      },
    })

    const html = await response.text()

    // Check for indicators of client-side rendering
    const indicators = [
      /<div id="root"><\/div>/,
      /<div id="app"><\/div>/,
      /__NEXT_DATA__/,
      /window\.__INITIAL_STATE__/,
      /<noscript>You need to enable JavaScript/i,
      /React/,
      /Vue/,
    ]

    return indicators.some(pattern => pattern.test(html))
  }
  catch {
    return false
  }
}
