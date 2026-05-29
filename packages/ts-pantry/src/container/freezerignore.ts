import fs from 'node:fs'
import path from 'node:path'

/**
 * pantry's home-themed `.dockerignore`. The build context is filtered by a
 * `.freezer` file in the context root; `.dockerignore` is honored as a
 * fallback for drop-in compatibility with existing projects.
 *
 * Syntax matches `.dockerignore`:
 *   - one pattern per line; blank lines and `#` comments are ignored
 *   - `*` matches any run of non-separator chars, `**` crosses separators
 *   - `?` matches a single non-separator char
 *   - a leading `!` negates (re-includes) a previously excluded path
 *   - a leading `/` is treated the same as no leading slash (patterns are
 *     always relative to the context root)
 */
export interface FreezerMatcher {
  /** Returns true when `relPath` (POSIX, relative to context root) is excluded. */
  ignores: (relPath: string) => boolean
  /** The compiled rules, in declaration order. */
  rules: FreezerRule[]
}

export interface FreezerRule {
  pattern: string
  negated: boolean
  regex: RegExp
}

const FREEZER_FILENAMES = ['.freezer', '.dockerignore']

/** Translate a single dockerignore-style pattern into a RegExp. */
function patternToRegex(pattern: string): RegExp {
  let p = pattern.trim()
  // Normalise separators and strip a single leading slash (patterns are
  // anchored to the context root either way).
  p = p.replace(/\\/g, '/')
  if (p.startsWith('/'))
    p = p.slice(1)
  // Collapse trailing slash — a dir pattern matches the dir and its contents.
  const trailingSlash = p.endsWith('/')
  if (trailingSlash)
    p = p.slice(0, -1)

  let re = '^'
  for (let i = 0; i < p.length; i++) {
    const c = p[i]
    if (c === '*') {
      if (p[i + 1] === '*') {
        // `**` — match across separators. Consume an optional following slash.
        i++
        if (p[i + 1] === '/')
          i++
        re += '.*'
      }
      else {
        re += '[^/]*'
      }
    }
    else if (c === '?') {
      re += '[^/]'
    }
    else if ('.+^${}()|[]'.includes(c)) {
      re += `\\${c}`
    }
    else {
      re += c
    }
  }
  // Match the path itself and anything nested beneath it.
  re += '(?:/.*)?$'
  return new RegExp(re)
}

/** Parse `.freezer` file contents into ordered rules. */
export function parseFreezer(content: string): FreezerRule[] {
  const rules: FreezerRule[] = []
  for (const rawLine of content.split('\n')) {
    const line = rawLine.replace(/\r$/, '').trim()
    if (line === '' || line.startsWith('#'))
      continue
    let pattern = line
    let negated = false
    if (pattern.startsWith('!')) {
      negated = true
      pattern = pattern.slice(1).trim()
    }
    if (pattern === '')
      continue
    rules.push({ pattern, negated, regex: patternToRegex(pattern) })
  }
  return rules
}

/** Build a matcher from already-parsed rules. */
export function createMatcher(rules: FreezerRule[]): FreezerMatcher {
  return {
    rules,
    ignores(relPath: string): boolean {
      const normalized = relPath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')
      // Later rules win (dockerignore semantics); a negation re-includes.
      let ignored = false
      for (const rule of rules) {
        if (rule.regex.test(normalized))
          ignored = !rule.negated
      }
      return ignored
    },
  }
}

/**
 * Load the freezer matcher for a build context. Reads `.freezer`, falling back
 * to `.dockerignore`. When `extraDir` is given (e.g. the directory holding the
 * Dockerfile), it is searched too — so a generated Dockerfile + `.freezer` pair
 * tucked away under `storage/framework` still filters the context. The freezer
 * file itself and `.git` are always excluded.
 */
export function loadFreezer(contextDir: string, extraDir?: string): FreezerMatcher {
  let content = ''
  let usedFile: string | undefined
  const searchDirs = extraDir && path.resolve(extraDir) !== path.resolve(contextDir)
    ? [contextDir, extraDir]
    : [contextDir]
  outer: for (const dir of searchDirs) {
    for (const name of FREEZER_FILENAMES) {
      const candidate = path.join(dir, name)
      if (fs.existsSync(candidate)) {
        content = fs.readFileSync(candidate, 'utf8')
        usedFile = name
        break outer
      }
    }
  }

  const rules = parseFreezer(content)
  // Always-on safety excludes (the ignore file and VCS metadata never belong
  // in an image), unless the user explicitly re-included them.
  const basePatterns = ['.freezer', '.dockerignore', '.git']
  for (const bp of basePatterns) {
    if (!rules.some(r => r.pattern === bp || (r.negated && r.pattern === bp)))
      rules.unshift({ pattern: bp, negated: false, regex: patternToRegex(bp) })
  }

  const matcher = createMatcher(rules) as FreezerMatcher & { sourceFile?: string }
  matcher.sourceFile = usedFile
  return matcher
}
