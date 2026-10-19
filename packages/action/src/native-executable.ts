import { readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'

// The native activation contract in install/symlink.zig. This is a fixed
// generated format, not a shell parser. Never execute a launcher to inspect it.
export const nativeActivationPrelude = `s=$0
while [ -h "$s" ]; do
  l=$(readlink "$s")
  case $l in
    /*) s=$l ;;
    *) case $s in */*) s=\${s%/*}/$l ;; *) s=$l ;; esac ;;
  esac
done
case $s in */*) d=\${s%/*} ;; *) d=. ;; esac
`

/** The package executable behind old activation links and native forwarders. */
export function resolveNativeExecutable(executable: string): string {
  const visited = new Set<string>()
  let current = executable
  for (let depth = 0; depth < 40; depth++) {
    const physical = realpathSync(current)
    if (visited.has(physical)) throw new Error('Cyclic Pantry executable activation')
    visited.add(physical)
    const stat = statSync(physical)
    if (!stat.isFile()) throw new Error('Pantry executable is not a regular file')
    // Native executables are usually much larger. The CLI also bounds its
    // activation-format read at 64 KiB.
    if (stat.size > 64 * 1024) return physical
    const content = readFileSync(physical, 'utf8')
    const suffix = '" "$@"\n'
    if (!content.endsWith(suffix)) return physical
    const relativePrefix = `#!/bin/sh\n${nativeActivationPrelude}exec "$d/`
    const absolutePrefix = '#!/bin/sh\nexec "'
    let target: string
    if (content.startsWith(relativePrefix)) {
      target = content.slice(relativePrefix.length, -suffix.length)
    }
    else if (content.startsWith(absolutePrefix)) {
      target = content.slice(absolutePrefix.length, -suffix.length)
      if (!isAbsolute(target)) return physical
    }
    else return physical
    if (!target || /["\\$`\r\n\0]/.test(target)) throw new Error('Invalid Pantry executable activation target')
    current = resolve(dirname(physical), target)
  }
  throw new Error('Pantry executable activation exceeded its link limit')
}
