/**
 * One-off: carry pkgx "props" files (patches, configs, shims) referenced by
 * native recipes into the repo, and wire up each recipe's `propsDir`.
 *
 * Native recipes (src/recipes/{domain}.ts) were converted from pkgx package.yml
 * build scripts that reference sibling files via `props/<name>` (e.g.
 * `patch -p1 <props/x509_def.c.diff`). Those files live in pkgxdev/pantry at
 * `projects/<domain>/<name>` but were never carried over, so the builds fail
 * with "props/<name>: No such file or directory". This fetches each referenced
 * file and writes it to `src/recipes/props/<domain>/<name>`, then sets
 * `propsDir: 'props/<domain>'` on the recipe (recipe-loader resolves it
 * relative to the recipe file and build-package copies it into buildDir/props/).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const RECIPES_DIR = join(import.meta.dir, '..', 'src', 'recipes')
const PROPS_ROOT = join(RECIPES_DIR, 'props')
const RAW = 'https://raw.githubusercontent.com/pkgxdev/pantry/main/projects'

async function fetchRaw(domain: string, name: string): Promise<string | null> {
  const url = `${RAW}/${domain}/${name}`
  const res = await fetch(url)
  if (!res.ok)
    return null
  return res.text()
}

async function main(): Promise<void> {
  const files = readdirSync(RECIPES_DIR).filter(f => f.endsWith('.ts'))
  let recipesFixed = 0
  let propsWritten = 0
  const failures: string[] = []

  for (const file of files) {
    const path = join(RECIPES_DIR, file)
    const content = readFileSync(path, 'utf-8')
    const refs = [...content.matchAll(/props\/([A-Za-z0-9._/-]+)/g)].map(m => m[1])
    if (refs.length === 0)
      continue

    const domain = file.replace(/\.ts$/, '')
    const uniqueRefs = [...new Set(refs)]
    const destDir = join(PROPS_ROOT, domain)

    let anyWritten = false
    for (const ref of uniqueRefs) {
      const dest = join(destDir, ref)
      if (existsSync(dest)) {
        anyWritten = true
        continue
      }
      const body = await fetchRaw(domain, ref)
      if (body == null) {
        failures.push(`${domain} -> props/${ref} (404 at ${RAW}/${domain}/${ref})`)
        continue
      }
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, body)
      propsWritten++
      anyWritten = true
      console.log(`  ✓ ${domain}/props/${ref} (${body.length} bytes)`)
    }

    // Wire up propsDir on the recipe if we have props and it isn't set yet.
    if (anyWritten && !/\bpropsDir\s*:/.test(content)) {
      const updated = content.replace(
        /(export const recipe\s*:\s*Recipe\s*=\s*\{\n)/,
        `$1  propsDir: 'props/${domain}',\n`,
      )
      if (updated !== content) {
        writeFileSync(path, updated)
        recipesFixed++
        console.log(`  + propsDir set on ${file}`)
      }
      else {
        failures.push(`${domain} -> could not insert propsDir (unexpected recipe shape)`)
      }
    }
  }

  console.log(`\nDone: ${propsWritten} props files written, ${recipesFixed} recipes wired.`)
  if (failures.length) {
    console.log(`\n${failures.length} issues:`)
    for (const f of failures) console.log(`  ✗ ${f}`)
  }
}

await main()
