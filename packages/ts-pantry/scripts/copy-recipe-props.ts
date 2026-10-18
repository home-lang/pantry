import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/** Explicit props directories contain recipe assets, including TypeScript. */
export function copyRecipeProps(directory: string | null, destination: string, explicitProps: boolean): string[] {
  if (!directory || !existsSync(directory)) return []
  const entries = readdirSync(directory).filter(name => name !== 'package.yml' && (explicitProps || !name.endsWith('.ts')))
  if (entries.length) {
    mkdirSync(destination, { recursive: true })
    for (const entry of entries)
      cpSync(join(directory, entry), join(destination, entry), { recursive: true })
  }
  return entries
}
