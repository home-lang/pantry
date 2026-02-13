/**
 * Lightweight web scraper using only Bun native APIs
 * No external dependencies required
 *
 * @example
 * ```ts
 * import { fetchHTML, parseHTML } from './web-scraper'
 *
 * // Simple usage
 * const doc = await fetchHTML('https://example.com')
 * const title = doc.querySelector('title')?.textContent
 *
 * // Advanced usage with custom options
 * const html = await fetch('https://example.com').then(r => r.text())
 * const doc = parseHTML(html)
 * const links = doc.querySelectorAll('a[href]')
 * links.forEach(link => console.log(link.getAttribute('href')))
 * ```
 */

export interface HTMLElement {
  tagName: string
  attributes: Record<string, string>
  textContent: string
  innerHTML: string
  children: HTMLElement[]
  parent: HTMLElement | null

  querySelector: (selector: string) => HTMLElement | null
  querySelectorAll: (selector: string) => HTMLElement[]
  getAttribute: (name: string) => string | null
  hasAttribute: (name: string) => boolean
  getElementById: (id: string) => HTMLElement | null
  getElementsByClassName: (className: string) => HTMLElement[]
  getElementsByTagName: (tagName: string) => HTMLElement[]
}

export interface Document extends HTMLElement {
  querySelector: (selector: string) => HTMLElement | null
  querySelectorAll: (selector: string) => HTMLElement[]
}

export interface FetchHTMLOptions {
  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number

  /**
   * Custom headers to send with the request
   */
  headers?: Record<string, string>

  /**
   * User agent string
   * @default 'Mozilla/5.0 (compatible; BunScraper/1.0)'
   */
  userAgent?: string

  /**
   * Whether to follow redirects
   * @default true
   */
  redirect?: 'follow' | 'manual' | 'error'

  /**
   * Signal for request abortion
   */
  signal?: AbortSignal
}

/**
 * Parse HTML string into a queryable Document object
 */
export function parseHTML(html: string): Document {
  const root = parseElement(html, 0, null)
  return createDocument(root)
}

/**
 * Fetch and parse HTML from a URL
 */
export async function fetchHTML(url: string, options: FetchHTMLOptions = {}): Promise<Document> {
  const {
    timeout = 30000,
    headers = {},
    userAgent = 'Mozilla/5.0 (compatible; BunScraper/1.0)',
    redirect = 'follow',
    signal,
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        ...headers,
      },
      redirect,
      signal: signal || controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    return parseHTML(html)
  }
  finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Extract text content from HTML, stripping all tags
 */
export function extractText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract all links from HTML
 */
export function extractLinks(html: string, baseUrl?: string): string[] {
  const links: string[] = []
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi

  let match = linkRegex.exec(html)
  while (match !== null) {
    const href = match[1]
    if (baseUrl && !href.startsWith('http')) {
      try {
        links.push(new URL(href, baseUrl).href)
      }
      catch {
        links.push(href)
      }
    }
    else {
      links.push(href)
    }
    match = linkRegex.exec(html)
  }

  return links
}

/**
 * Extract meta tags from HTML
 */
export function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {}
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const metaRegex = /<meta[\s\S]+?([^>]+)>/gi

  let match = metaRegex.exec(html)
  while (match !== null) {
    const attrs = parseAttributes(match[1])
    const name = attrs.name || attrs.property || attrs['http-equiv']
    const content = attrs.content

    if (name && content) {
      meta[name] = content
    }
    match = metaRegex.exec(html)
  }

  return meta
}

// Internal implementation

interface ParsedElement {
  tagName: string
  attributes: Record<string, string>
  textContent: string
  innerHTML: string
  children: ParsedElement[]
  parent: ParsedElement | null
}

function createHTMLElement(parsed: ParsedElement): HTMLElement {
  const element: HTMLElement = {
    tagName: parsed.tagName,
    attributes: parsed.attributes,
    textContent: parsed.textContent,
    innerHTML: parsed.innerHTML,
    children: parsed.children.map(createHTMLElement),
    parent: null,

    querySelector(selector: string): HTMLElement | null {
      return querySelector(this, selector)
    },

    querySelectorAll(selector: string): HTMLElement[] {
      return querySelectorAll(this, selector)
    },

    getAttribute(name: string): string | null {
      return this.attributes[name] || null
    },

    hasAttribute(name: string): boolean {
      return name in this.attributes
    },

    getElementById(id: string): HTMLElement | null {
      if (this.attributes.id === id)
        return this
      for (const child of this.children) {
        const found = child.getElementById(id)
        if (found)
          return found
      }
      return null
    },

    getElementsByClassName(className: string): HTMLElement[] {
      const results: HTMLElement[] = []
      const classes = this.attributes.class?.split(/\s+/) || []
      if (classes.includes(className))
        results.push(this)
      for (const child of this.children) {
        results.push(...child.getElementsByClassName(className))
      }
      return results
    },

    getElementsByTagName(tagName: string): HTMLElement[] {
      const results: HTMLElement[] = []
      if (this.tagName.toLowerCase() === tagName.toLowerCase())
        results.push(this)
      for (const child of this.children) {
        results.push(...child.getElementsByTagName(tagName))
      }
      return results
    },
  }

  // Set parent references
  for (const child of element.children) {
    child.parent = element
  }

  return element
}

function createDocument(root: ParsedElement): Document {
  return createHTMLElement(root) as Document
}

function parseElement(html: string, startIndex: number, parent: ParsedElement | null): ParsedElement {
  const root: ParsedElement = {
    tagName: 'root',
    attributes: {},
    textContent: '',
    innerHTML: html,
    children: [],
    parent,
  }

  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const tagRegex = /<(\w+)([\s\S]*?)>/g
  const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

  let lastIndex = 0
  const stack: ParsedElement[] = [root]

  tagRegex.lastIndex = startIndex
  let match = tagRegex.exec(html)

  while (match !== null) {
    const [, tagName, attributesStr] = match
    const matchIndex = match.index

    // Add text content before this tag
    if (matchIndex > lastIndex) {
      const textContent = html.slice(lastIndex, matchIndex).trim()
      if (textContent) {
        const current = stack[stack.length - 1]
        current.textContent += textContent
      }
    }

    const attributes = parseAttributes(attributesStr)
    const isSelfClosing = selfClosingTags.has(tagName.toLowerCase()) || attributesStr.trim().endsWith('/')

    const element: ParsedElement = {
      tagName,
      attributes,
      textContent: '',
      innerHTML: '',
      children: [],
      parent: stack[stack.length - 1],
    }

    stack[stack.length - 1].children.push(element)

    if (!isSelfClosing) {
      stack.push(element)
    }

    lastIndex = tagRegex.lastIndex

    // Look for closing tag
    if (!isSelfClosing) {
      const closingPattern = new RegExp(`</${tagName}>`, 'i')
      const closingMatch = closingPattern.exec(html.slice(lastIndex))

      if (closingMatch) {
        const closingIndex = lastIndex + closingMatch.index
        const innerHtml = html.slice(lastIndex, closingIndex)

        element.innerHTML = innerHtml
        element.textContent = extractText(innerHtml)

        // Parse children
        if (innerHtml.includes('<')) {
          element.children = []
          parseChildren(innerHtml, element)
        }
        else {
          element.textContent = innerHtml.trim()
        }

        lastIndex = closingIndex + closingMatch[0].length
        tagRegex.lastIndex = lastIndex
        stack.pop()
      }
    }
    match = tagRegex.exec(html)
  }

  // Add remaining text content
  if (lastIndex < html.length) {
    const textContent = html.slice(lastIndex).trim()
    if (textContent) {
      root.textContent += textContent
    }
  }

  return root
}

function parseChildren(html: string, parent: ParsedElement): void {
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const tagRegex = /<(\w+)([\s\S]*?)>/g
  const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

  let lastIndex = 0
  let match = tagRegex.exec(html)

  while (match !== null) {
    const [, tagName, attributesStr] = match
    const matchIndex = match.index

    // Add text node if there's content before this tag
    if (matchIndex > lastIndex) {
      const textContent = html.slice(lastIndex, matchIndex).trim()
      if (textContent) {
        parent.textContent += textContent
      }
    }

    const attributes = parseAttributes(attributesStr)
    const isSelfClosing = selfClosingTags.has(tagName.toLowerCase()) || attributesStr.trim().endsWith('/')

    const closingPattern = new RegExp(`</${tagName}>`, 'i')
    const remainingHtml = html.slice(tagRegex.lastIndex)
    const closingMatch = closingPattern.exec(remainingHtml)

    const element: ParsedElement = {
      tagName,
      attributes,
      textContent: '',
      innerHTML: '',
      children: [],
      parent,
    }

    if (!isSelfClosing && closingMatch) {
      const innerHtml = remainingHtml.slice(0, closingMatch.index)
      element.innerHTML = innerHtml
      element.textContent = extractText(innerHtml)

      // Recursively parse children
      if (innerHtml.includes('<')) {
        parseChildren(innerHtml, element)
      }
      else {
        element.textContent = innerHtml.trim()
      }

      lastIndex = tagRegex.lastIndex + closingMatch.index + closingMatch[0].length
      tagRegex.lastIndex = lastIndex
    }
    else {
      lastIndex = tagRegex.lastIndex
    }

    parent.children.push(element)
    match = tagRegex.exec(html)
  }
}

function parseAttributes(attrString: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  const attrRegex = /(\w+)(?:=["']([^"']*)["']|=([^\s>]+)|(?=\s|>|$))/g

  let match = attrRegex.exec(attrString)
  while (match !== null) {
    const name = match[1]
    const value = match[2] || match[3] || ''
    attributes[name] = value
    match = attrRegex.exec(attrString)
  }

  return attributes
}

function querySelector(element: HTMLElement, selector: string): HTMLElement | null {
  const results = querySelectorAll(element, selector)
  return results[0] || null
}

function querySelectorAll(element: HTMLElement, selector: string): HTMLElement[] {
  const results: HTMLElement[] = []

  // Simple selector parsing (supports tag, class, id, and attribute selectors)
  const parts = selector.match(/([.#[]?)([^\s.#[]+)/g) || []

  for (const part of parts) {
    if (part.startsWith('#')) {
      // ID selector
      const id = part.slice(1)
      const found = element.getElementById(id)
      if (found)
        results.push(found)
    }
    else if (part.startsWith('.')) {
      // Class selector
      const className = part.slice(1)
      results.push(...element.getElementsByClassName(className))
    }
    else if (part.startsWith('[')) {
      // Attribute selector
      const attrMatch = part.match(/\[(\w+)(?:=["']?([^"'\]]+)["']?)?\]/)
      if (attrMatch) {
        const [, attrName, attrValue] = attrMatch
        results.push(...filterByAttribute(element, attrName, attrValue))
      }
    }
    else {
      // Tag selector
      results.push(...element.getElementsByTagName(part))
    }
  }

  // Handle compound selectors (e.g., "a.className" or "div#id")
  if (selector.includes('.') || selector.includes('#') || selector.includes('[')) {
    return results.filter((el) => {
      if (selector.includes('.')) {
        const classNames = selector.match(/\.([^\s.#[]+)/g)?.map(c => c.slice(1)) || []
        const elementClasses = el.attributes.class?.split(/\s+/) || []
        if (!classNames.every(cn => elementClasses.includes(cn)))
          return false
      }

      if (selector.includes('#')) {
        const idMatch = selector.match(/#([^\s.#[]+)/)
        if (idMatch && el.attributes.id !== idMatch[1])
          return false
      }

      const tagMatch = selector.match(/^(\w+)/)
      if (tagMatch && el.tagName.toLowerCase() !== tagMatch[1].toLowerCase())
        return false

      return true
    })
  }

  return results
}

function filterByAttribute(element: HTMLElement, attrName: string, attrValue?: string): HTMLElement[] {
  const results: HTMLElement[] = []

  function traverse(el: HTMLElement): void {
    if (el.hasAttribute(attrName)) {
      if (!attrValue || el.getAttribute(attrName) === attrValue) {
        results.push(el)
      }
    }
    for (const child of el.children) {
      traverse(child)
    }
  }

  traverse(element)
  return results
}

/**
 * Helper to wait for a condition (useful for client-side rendered content)
 * Note: This is a simple polling implementation since we can't execute JavaScript
 */
export async function waitFor(condition: () => boolean | Promise<boolean>, options: { timeout?: number, interval?: number } = {}): Promise<void> {
  const { timeout = 5000, interval = 100 } = options
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`)
}

/**
 * Batch fetch multiple URLs in parallel
 */
export async function fetchMultiple(urls: string[], options: FetchHTMLOptions = {}): Promise<Map<string, Document>> {
  const results = new Map<string, Document>()

  const promises = urls.map(async (url) => {
    try {
      const doc = await fetchHTML(url, options)
      results.set(url, doc)
    }
    catch (error) {
      console.error(`Failed to fetch ${url}:`, error)
    }
  })

  await Promise.all(promises)
  return results
}

/**
 * Extract structured data from common formats
 */
export function extractStructuredData(html: string): {
  jsonLd: any[]
  openGraph: Record<string, string>
  twitter: Record<string, string>
  microdata: any[]
} {
  const jsonLd: any[] = []
  const openGraph: Record<string, string> = {}
  const twitter: Record<string, string> = {}
  const microdata: any[] = []

  // Extract JSON-LD
  const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match = jsonLdRegex.exec(html)
  while (match !== null) {
    try {
      jsonLd.push(JSON.parse(match[1]))
    }
    catch {
      // Invalid JSON
    }
    match = jsonLdRegex.exec(html)
  }

  // Extract Open Graph
  const ogRegex = /<meta[^>]+property=["']og:([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi
  let ogMatch = ogRegex.exec(html)
  while (ogMatch !== null) {
    openGraph[ogMatch[1]] = ogMatch[2]
    ogMatch = ogRegex.exec(html)
  }

  // Extract Twitter Card
  const twitterRegex = /<meta[^>]+name=["']twitter:([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi
  let twitterMatch = twitterRegex.exec(html)
  while (twitterMatch !== null) {
    twitter[twitterMatch[1]] = twitterMatch[2]
    twitterMatch = twitterRegex.exec(html)
  }

  return { jsonLd, openGraph, twitter, microdata }
}
