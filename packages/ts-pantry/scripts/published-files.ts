import { lstatSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs'
import { join, relative } from 'node:path'

/** Apply the recipe's public product boundary before inspecting native runtimes. */
export function selectPublishedFiles(prefix: string, patterns?: string[]): void {
  if (!patterns) return
  if (!patterns.length || patterns.some(pattern => pattern.startsWith('/') || pattern.split('/').includes('..')))
    throw new Error('Published file patterns must be nonempty and package-relative')
  const matchers = patterns.map(pattern => new Bun.Glob(pattern))
  const files: string[] = []
  const directories: string[] = []
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry)
      if (lstatSync(path).isDirectory()) { walk(path); directories.push(path) }
      else files.push(path)
    }
  }
  walk(prefix)
  const selected = files.filter(path => matchers.some(pattern => pattern.match(relative(prefix, path))))
  if (!selected.length) throw new Error('Published file selection contains no package products')
  const keep = new Set(selected)
  for (const file of files) if (!keep.has(file)) unlinkSync(file)
  for (const directory of directories) if (!readdirSync(directory).length) rmdirSync(directory)
}
