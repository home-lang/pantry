import fs from 'node:fs'
import path from 'node:path'

export function selectSystemPackages(explicitPackages: string, setupOnly: boolean, detectedPackages: () => string[]): string[] {
  const explicit = explicitPackages.split(/\s+/).filter(Boolean)
  if (explicit.length) return explicit
  return setupOnly ? [] : detectedPackages()
}

export function shouldInstallWorkspace(explicitPackages: string, setupOnly: boolean): boolean {
  return !setupOnly && explicitPackages.trim().length === 0
}

export async function installRequiredSystemPackages(
  packages: string[],
  install: (packageSpecs: string[]) => Promise<void>,
): Promise<void> {
  if (!packages.length) return
  try {
    await install(packages)
  }
  catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`Required system packages ${packages.join(', ')} failed to install: ${detail}`)
  }
}

/**
 * Whether the project's JS dependencies still need installing. `pantry install`
 * hands them to the project's JS package manager, which puts them in
 * node_modules - outside the `pantry/` directory the action caches - and marks
 * the install with `node_modules/.pantry-js-installed`. A cache hit on a fresh
 * checkout therefore restores everything but node_modules, and has to run the
 * install again to get it. Mirrors `hasJsDeps` in the CLI's js_delegate.zig:
 * domain-style names (`bun.sh`, `ziglang.org`) are system deps, not JS ones.
 */
export function needsJsInstall(projectDir: string): boolean {
  let pkg: Record<string, unknown>
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf-8'))
  }
  catch {
    return false
  }
  const hasJsDeps = ['dependencies', 'devDependencies', 'optionalDependencies'].some((section) => {
    const deps = pkg?.[section]
    return deps !== null && typeof deps === 'object' && Object.keys(deps).some(name => !name.includes('.'))
  })
  return hasJsDeps && !fs.existsSync(path.join(projectDir, 'node_modules', '.pantry-js-installed'))
}

/**
 * The JS package manager `pantry install` hands a project's JS deps to: the
 * one whose lockfile is present, else the `packageManager` field, else bun.
 * Mirrors `pickPackageManager` in the CLI's js_delegate.zig.
 */
export function jsPackageManager(projectDir: string): 'bun' | 'pnpm' | 'yarn' | 'npm' {
  const lockfiles = [
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
  ] as const
  for (const [lockfile, pm] of lockfiles) {
    if (fs.existsSync(path.join(projectDir, lockfile)))
      return pm
  }
  try {
    const field = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf-8'))?.packageManager
    const name = typeof field === 'string' ? field.split('@')[0] : ''
    if (name === 'bun' || name === 'pnpm' || name === 'yarn' || name === 'npm')
      return name
  }
  catch {}
  return 'bun'
}

/**
 * Whether a pantry config file might choose the JS linker (`install.linker`),
 * which only `pantry install` knows how to read and pass on. Without one, the
 * package manager decides its own layout, exactly as under `pantry install`.
 */
export function pantryConfigMaySetLinker(projectDir: string): boolean {
  const configs = ['pantry.toml', 'pantry.jsonc', 'pantry.json', 'pantry.config.ts', '.config/pantry.ts', 'config/pantry.ts']
  return configs.some((file) => {
    try {
      return fs.readFileSync(path.join(projectDir, file), 'utf-8').includes('linker')
    }
    catch {
      return false
    }
  })
}
