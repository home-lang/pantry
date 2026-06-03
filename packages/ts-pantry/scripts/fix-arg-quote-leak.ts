#!/usr/bin/env bun
/**
 * Strip literal double-quotes from configure/cmake flag tokens in recipe env
 * arrays. Recipes pass these via an UNQUOTED expansion (`./configure $ARGS`),
 * so a token like `--prefix="{{prefix}}"` reaches configure with the quotes
 * intact → "expected an absolute directory name". The values here never
 * contain spaces, so the quotes are purely harmful. Only space-free quoted
 * values are touched; anything with an embedded space is left alone (it may
 * legitimately need quoting).
 *
 * Usage: bun scripts/fix-arg-quote-leak.ts [--dry]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const RECIPES_DIR = join(import.meta.dir, '..', 'src', 'recipes')
const dry = process.argv.includes('--dry')

function walk(dir: string): string[] {
  const out: string[] = []
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (p.endsWith('.ts')) out.push(p)
  }
  return out
}

// A single-quoted TS string token of the form '<flag>=<value>' where value
// carries literal double-quotes around a space-free chunk. Two shapes:
//   '--prefix="{{prefix}}"'        → '--prefix={{prefix}}'
//   '--sysconfdir="$SHELF"/etc'    → '--sysconfdir=$SHELF/etc'
// Implemented as: inside a single-quoted string that starts with `-` and
// contains no space, drop every `"`.
function fixLine(line: string): string {
  return line.replace(/'(-[^'\n]*)'/g, (full, inner: string) => {
    if (!inner.includes('"')) return full
    if (/\s/.test(inner)) return full // has a space → quotes may matter, skip
    return `'${inner.replace(/"/g, '')}'`
  })
}

const files = walk(RECIPES_DIR)
const changed: string[] = []
for (const f of files) {
  const src = readFileSync(f, 'utf-8')
  const out = src.split('\n').map(fixLine).join('\n')
  if (out !== src) {
    changed.push(f)
    if (!dry) writeFileSync(f, out)
  }
}

console.log(`${dry ? '[dry] would change' : 'changed'} ${changed.length} files`)
for (const c of changed) console.log('  ', c.replace(RECIPES_DIR + '/', ''))
