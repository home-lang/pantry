import { join } from 'node:path'

const REPO_ROOT = join(import.meta.dir, '..', '..', '..')
const PACKAGE_ROOT = 'packages/ts-pantry/src/packages/'
const RECIPE_ROOT = 'packages/ts-pantry/src/recipes/'

function git(args: string[], cwd = REPO_ROOT): string | null {
  const result = Bun.spawnSync(['git', ...args], {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
  })
  return result.exitCode === 0 ? result.stdout.toString().trim() : null
}

export function packageDomain(source: string): string | null {
  return source.match(/\bdomain:\s*['"]([^'"]+)['"]/)?.[1] ?? null
}

export function packageVersions(source: string): string[] | null {
  const body = source.match(/\bversions:\s*\[([\s\S]*?)\]\s*as const/)?.[1]
  return body == null ? null : [...body.matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1]!)
}

export function versionsChanged(before: string | null, after: string | null): boolean {
  if (before == null || after == null) return before !== after
  return JSON.stringify(packageVersions(before)) !== JSON.stringify(packageVersions(after))
}

function sourceAt(ref: string, path: string, cwd: string): string | null {
  return git(['show', `${ref}:${path}`], cwd)
}

export function changedPackageDomains(beforeRef: string, afterRef: string, cwd: string = REPO_ROOT): string[] {
  const changed = git([
    'diff', '--name-only', beforeRef, afterRef, '--',
    `${RECIPE_ROOT}**`, `${PACKAGE_ROOT}**`,
  ], cwd)
  if (!changed) return []

  const domains = new Set<string>()
  for (const path of changed.split('\n').filter(Boolean)) {
    // A recipe asset belongs to the closest matching recipe, including domains
    // with slash segments. Rebuild its owner for deleted assets too.
    if (path.startsWith(`${RECIPE_ROOT}props/`)) {
      const parts = path.slice(`${RECIPE_ROOT}props/`.length).split('/')
      for (let count = parts.length - 1; count > 0; count--) {
        const recipe = `${RECIPE_ROOT}${parts.slice(0, count).join('/')}.ts`
        const source = sourceAt(afterRef, recipe, cwd) ?? sourceAt(beforeRef, recipe, cwd)
        const domain = source && packageDomain(source)
        if (domain) {
          domains.add(domain)
          break
        }
      }
      continue
    }
    const after = sourceAt(afterRef, path, cwd)
    if (after == null) continue

    if (path.startsWith(RECIPE_ROOT)) {
      const fallback = path.slice(RECIPE_ROOT.length).replace(/\.ts$/, '')
      domains.add(packageDomain(after) ?? fallback)
      continue
    }

    if (!path.startsWith(PACKAGE_ROOT) || path.startsWith(`${PACKAGE_ROOT}apps/`) || path.startsWith(`${PACKAGE_ROOT}fonts/`))
      continue

    if (versionsChanged(sourceAt(beforeRef, path, cwd), after)) {
      const domain = packageDomain(after)
      if (domain) domains.add(domain)
    }
  }

  return [...domains].sort()
}

if (import.meta.main) {
  const [beforeRef, afterRef] = process.argv.slice(2)
  if (!beforeRef || !afterRef) {
    console.error('Usage: bun changed-package-domains.ts <before-ref> <after-ref>')
    process.exit(1)
  }
  console.log(changedPackageDomains(beforeRef, afterRef).join(' '))
}
