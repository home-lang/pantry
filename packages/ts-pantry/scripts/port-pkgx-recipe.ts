#!/usr/bin/env bun
/**
 * Port a pkgx `package.yml` build recipe into a native pantry TS recipe.
 *
 * The pantry has metadata (versions/deps/programs) for ~1700 packages but a
 * build recipe (distributable + build script) for only ~676. pkgx publishes the
 * build instructions as projects/<domain>/package.yml; this fetches that and
 * converts it to src/recipes/<domain>.ts so we can BUILD the package ourselves
 * (no binary mirroring). Build props referenced via props/<name> are fetched
 * separately by carry-pkgx-props.ts.
 *
 * Usage:
 *   bun scripts/port-pkgx-recipe.ts <domain> [<domain> ...]
 *   bun scripts/port-pkgx-recipe.ts --file /tmp/no-recipe.txt [--start N --count M]
 */
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const RAW = 'https://raw.githubusercontent.com/pkgxdev/pantry/main/projects'
const RECIPES_DIR = join(import.meta.dir, '..', 'src', 'recipes')

// ── serialize a JS value to readable TS source ─────────────────────────
function ser(v: any, indent = 2): string {
  const pad = ' '.repeat(indent)
  const pad2 = ' '.repeat(indent + 2)
  if (v === null) return 'null'
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]'
    const items = v.map(x => `${pad2}${ser(x, indent + 2)}`).join(',\n')
    return `[\n${items},\n${pad}]`
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v)
    if (keys.length === 0) return '{}'
    const body = keys.map((k) => {
      const key = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : `'${k}'`
      return `${pad2}${key}: ${ser(v[k], indent + 2)}`
    }).join(',\n')
    return `{\n${body},\n${pad}}`
  }
  return 'undefined'
}

// ── pkgx YAML → recipe object ──────────────────────────────────────────
function programsFromProvides(provides: any): string[] {
  if (!provides) return []
  const arr = Array.isArray(provides) ? provides : [provides]
  return arr
    .filter((p: any) => typeof p === 'string')
    .map((p: string) => p.replace(/^(bin|sbin)\//, ''))
    .filter((p: string) => !p.includes('/')) // skip lib/include entries
}

function normDistributable(d: any): any {
  if (!d) return undefined
  const pick = Array.isArray(d) ? d[0] : d
  if (typeof pick === 'string') return { url: pick }
  const out: any = { url: pick.url }
  if (pick['strip-components'] !== undefined) out.stripComponents = pick['strip-components']
  return out
}

function normScript(script: any): any[] {
  if (script === undefined || script === null) return []
  if (typeof script === 'string') return script.split('\n').filter(Boolean)
  if (!Array.isArray(script)) return [String(script)]
  return script.map((step: any) => {
    if (typeof step === 'string') return step
    if (step && typeof step === 'object') {
      const out: any = {}
      out.run = Array.isArray(step.run) ? step.run.join('\n') : String(step.run ?? '')
      if (step.if !== undefined) out.if = String(step.if)
      if (step['working-directory'] !== undefined) out['working-directory'] = String(step['working-directory'])
      return out
    }
    return String(step)
  })
}

function build(domain: string, yaml: any): string {
  const name = domain.split('/').pop()!.replace(/\.[a-z]+$/, '') || domain
  const recipe: any = { domain, name }

  const programs = programsFromProvides(yaml.provides)
  recipe.programs = programs

  if (yaml.dependencies) recipe.dependencies = yaml.dependencies

  const b = yaml.build
  const buildObj = (b && typeof b === 'object' && !Array.isArray(b)) ? b : null
  if (buildObj?.dependencies) recipe.buildDependencies = buildObj.dependencies

  recipe.distributable = normDistributable(yaml.distributable)

  // build block
  const script = normScript(buildObj ? buildObj.script : b)
  recipe.build = { script }
  if (buildObj?.env) recipe.build.env = buildObj.env

  // test (optional)
  if (yaml.test) {
    const t = Array.isArray(yaml.test) ? yaml.test : (yaml.test.script || [])
    if (t.length) recipe.test = { script: normScript(t).map((s: any) => typeof s === 'string' ? s : s.run) }
  }

  // order keys nicely
  const ordered: any = { domain: recipe.domain, name: recipe.name, programs: recipe.programs }
  if (recipe.dependencies) ordered.dependencies = recipe.dependencies
  if (recipe.buildDependencies) ordered.buildDependencies = recipe.buildDependencies
  ordered.distributable = recipe.distributable
  ordered.build = recipe.build
  if (recipe.test) ordered.test = recipe.test

  const depth = domain.split('/').length // src/recipes vs src/recipes/sub
  const importPath = '../'.repeat(depth + 1) + 'scripts/recipe-types'
  return `import type { Recipe } from '${importPath}'\n\nexport const recipe: Recipe = ${ser(ordered, 0)}\n`
}

async function port(domain: string): Promise<'ok' | 'no-yaml' | 'no-build' | 'exists' | 'error'> {
  const outPath = join(RECIPES_DIR, `${domain}.ts`)
  if (existsSync(outPath)) return 'exists'
  let text: string
  try {
    const r = await fetch(`${RAW}/${domain}/package.yml`, { signal: AbortSignal.timeout(20000) })
    if (!r.ok) return 'no-yaml'
    text = await r.text()
  }
  catch { return 'error' }
  let yaml: any
  try { yaml = (Bun as any).YAML.parse(text) }
  catch { return 'error' }
  if (!yaml || (!yaml.build && !yaml.distributable)) return 'no-build'
  const ts = build(domain, yaml)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, ts)
  // sanity: import the freshly-written file (absolute path). If it doesn't load
  // or doesn't export a valid recipe, DELETE it so we never leave broken files.
  try {
    const mod = await import(outPath)
    if (!mod.recipe || !mod.recipe.domain)
      throw new Error('no recipe export')
  }
  catch {
    try { unlinkSync(outPath) }
    catch { /* ignore */ }
    return 'error'
  }
  return 'ok'
}

async function main() {
  const args = process.argv.slice(2)
  let domains: string[] = []
  const fileIdx = args.indexOf('--file')
  if (fileIdx >= 0) {
    domains = readFileSync(args[fileIdx + 1], 'utf-8').split('\n').map(s => s.trim()).filter(Boolean)
    const s = args.indexOf('--start'); const c = args.indexOf('--count')
    const start = s >= 0 ? Number.parseInt(args[s + 1], 10) : 0
    const count = c >= 0 ? Number.parseInt(args[c + 1], 10) : domains.length
    domains = domains.slice(start, start + count)
  }
  else {
    domains = args.filter(a => !a.startsWith('--'))
  }

  const tally: Record<string, number> = { ok: 0, 'no-yaml': 0, 'no-build': 0, exists: 0, error: 0 }
  const okList: string[] = []
  const conc = 12
  let i = 0
  async function worker() {
    while (i < domains.length) {
      const d = domains[i++]
      const res = await port(d)
      tally[res]++
      if (res === 'ok') okList.push(d)
      if (res === 'ok' || res === 'error') console.log(`${res === 'ok' ? '✓' : '✗'} ${d}`)
    }
  }
  await Promise.all(Array.from({ length: conc }, worker))
  console.log('\n=== tally ===', JSON.stringify(tally))
  writeFileSync('/tmp/ported-ok.txt', okList.join('\n'))
}

main()
