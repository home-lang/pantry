import { accessSync, constants, realpathSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, sep } from 'node:path'

/** Refuse an artifact that cannot supply the executable interface it promises. */
export function verifyDeclaredPrograms(prefix: string, domain: string, programs: string[] = []): void {
  const root = realpathSync(prefix)
  for (const program of programs) {
    if (program.includes('{{')) continue
    if (!program || isAbsolute(program) || program.split(/[\\/]/).some(part => part === '..' || part === '.'))
      throw new Error(`${domain}: invalid declared program ${program}`)
    let usable = false
    for (const directory of ['bin', 'sbin', '']) {
      try {
        const candidate = realpathSync(join(root, directory, program))
        const inside = relative(root, candidate)
        if (inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside)) continue
        const metadata = statSync(candidate)
        if (!metadata.isFile() || !metadata.size) continue
        accessSync(candidate, process.platform === 'win32' ? constants.F_OK : constants.X_OK)
        usable = true
        break
      }
      catch { /* Try the remaining package-owned executable locations. */ }
    }
    if (!usable) throw new Error(`${domain}: declared program ${program} is missing, empty, non-executable or outside its package prefix`)
  }
}
