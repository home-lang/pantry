#!/usr/bin/env bun
import { join, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pagesDir = join(__dirname, 'pages')
const port = Number(process.env.PORT || 3002)

// Discover all .stx files recursively
function discoverFiles(dir: string, base = ''): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...discoverFiles(join(dir, entry.name), rel))
    }
else if (entry.name.endsWith('.stx')) {
      files.push(rel)
    }
  }
  return files
}

const stxFiles = discoverFiles(pagesDir)

// Build route table
// pages/index.stx -> /
// pages/graph.stx -> /graph
// pages/report.stx -> /report
// pages/package/[name].stx -> /package/:name (dynamic)
const routes: Array<{ pattern: RegExp, file: string, paramNames: string[] }> = []

for (const file of stxFiles) {
  const route = file
    .replace(/\.stx$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '')

  const paramNames: string[] = []
  const patternStr = route.replace(/\[([^\]]+)\]/g, (_, name) => {
    paramNames.push(name)
    return '([^/]+)'
  })

  routes.push({
    pattern: new RegExp(`^/${patternStr}$`),
    file: join(pagesDir, file),
    paramNames,
  })
}

// Process an stx file with server scripts
async function processStxFile(filePath: string, params: Record<string, string> = {}): Promise<string> {
  const content = readFileSync(filePath, 'utf-8')

  // Extract and run server script
  const serverMatch = content.match(/<script\s+server\b[^>]*>([\s\S]*?)<\/script>/i)
  const templateContent = serverMatch
    ? content.replace(/<script\s+server\b[^>]*>[\s\S]*?<\/script>/gi, '')
    : content

  const context: Record<string, any> = {
    __filename: filePath,
    __dirname: dirname(filePath),
    ...params,
  }

  if (serverMatch) {
    const { extractVariables, processDirectives, defaultConfig } = await import('@stacksjs/stx')
    try {
      await extractVariables(serverMatch[1], context, filePath)
    }
catch (e: any) {
      console.error(`extractVariables error for ${filePath}:`, e.message || e)
    }
    let output = templateContent
    const dependencies = new Set<string>()
    output = await processDirectives(output, context, filePath, defaultConfig, dependencies)
    return output
  }

  // No server script, just process directives
  const { processDirectives, defaultConfig } = await import('@stacksjs/stx')
  let output = templateContent
  const dependencies = new Set<string>()
  output = await processDirectives(output, context, filePath, defaultConfig, dependencies)
  return output
}

// Start server
console.log(`\n  \x1b[36mpantry\x1b[0m inspector\n`)
console.log(`  Server running at \x1b[36mhttp://localhost:${port}\x1b[0m\n`)

// eslint-disable-next-line pickier/no-unused-vars
const routeCache = new Map<string, string>()

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)
    let pathname = url.pathname

    // Normalize trailing slash
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }

    // Try to find matching route
    for (const route of routes) {
      const match = pathname.match(route.pattern)
      if (match) {
        const params: Record<string, string> = {}
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1])
        })

        // Cache key includes params
        // eslint-disable-next-line pickier/no-unused-vars
        const cacheKey = `${route.file}:${JSON.stringify(params)}`

        try {
          // Don't cache in dev for hot reload
          const html = await processStxFile(route.file, params)
          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        }
catch (err: any) {
          console.error(`Error processing ${route.file}:`, err.message || err)
          return new Response(`<pre>Error: ${err.message || err}</pre>`, {
            status: 500,
            headers: { 'Content-Type': 'text/html' },
          })
        }
      }
    }

    return new Response('Not Found', { status: 404 })
  },
})
