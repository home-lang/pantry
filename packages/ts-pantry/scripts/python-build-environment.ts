import { existsSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, sep } from 'node:path'

/** Discover module directories only inside checksummed, declared dependencies. */
export function dependencyPythonPaths(prefixes: readonly string[]): string[] {
  const result = new Set<string>()
  for (const prefix of new Set(prefixes)) {
    const root = realpathSync(prefix)
    const owned = (file: string): string => {
      const actual = realpathSync(file)
      const local = relative(root, actual)
      if (local === '..' || local.startsWith(`..${sep}`) || isAbsolute(local))
        throw new Error(`Python module directory escapes its declared package: ${file}`)
      return actual
    }
    for (const directory of ['lib', 'lib64', 'venv/lib', 'venv/lib64']) {
      const library = join(root, directory)
      if (!existsSync(library)) continue
      for (const name of readdirSync(owned(library)).sort()) {
        if (!/^python\d+(?:\.\d+)?$/.test(name)) continue
        for (const folder of ['site-packages', 'dist-packages']) {
          const candidate = join(library, name, folder)
          if (existsSync(candidate) && statSync(candidate).isDirectory()) result.add(owned(candidate))
        }
      }
    }
  }
  return [...result]
}
